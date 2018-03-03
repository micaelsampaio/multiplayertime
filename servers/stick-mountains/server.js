"use strict";

var express = require('express');
var colors = require('colors/safe')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {transports: ['websocket']});

var RoomsManager = require('../rooms');

var Player = require('./classes').Player;
var Block = require('./classes').Block;

http.listen(8002);

console.log(colors.gray(`
	+-----------------------------------------------------+
	|                                                     |
	|                STICK MOUNTAINS                      |
	|                                                     |
	|       Server at:   http://localhost:8002            |
	|                                                     |
	+-----------------------------------------------------+
`));

///Load game info
var blockInfo = {height : 100, minWidth: 20, maxWidth: 100, minGap: 30, maxGap: 350,types: 3};
var gameInfo = {playerWidth: 80, playerHeight: 80, gameY: 500, maxPower: 550, hp: 3};

//
var manager = new RoomsManager(io, Game, 1, 4);

function Game(room){
	var room = room;
	var players;
	var blocks;
	var currentX = 0;
	var startX = 0;

	var STATE = {LOBBY : 0, STARTGAME: 1, GAME: 2, ENDGAME: 3 };
	var state = STATE.LOBBY;
	var readyPlayers = [];

	this.startGame = function(){
		if(state == STATE.LOBBY){
			state = STATE.STARTGAME;
			var startTime = (new Date()).getTime();
			//restart variables
			players = [];
			readyPlayers = [];
			blocks = [];
			currentX = 0;
			startX = 0;

			blocks.push(startBlock());
			for(var i = 0; i < 9; i++){
				blocks.push(newBlock());
			}
			//player info
			for(var i = 0; i < room.getPlayers().length; i++){
				var player = room.getPlayer(i);
				players.push(new Player(player, startX + i * gameInfo.playerWidth, gameInfo.gameY, 
					gameInfo.playerWidth, gameInfo.playerHeight, (i == 0 ? "police" : "unicorn"), gameInfo.hp));
				//CLEAR EVENTS
				player.removeAllListeners("ready");
				player.removeAllListeners("play");
				player.removeAllListeners("dead");
				//SET EVENTS
				player.on("ready", this.onReady);
				player.on("play", this.onPlay);
				player.on("dead", this.onDead);
			}
			//send info
			room.emit("startGame", {players: getPlayersStartInfo(), playerWidth:gameInfo.playerWidth, playerHeight:gameInfo.playerHeight,
				gameY: gameInfo.gameY, maxPower: gameInfo.maxPower, blocks: blocks, hp: gameInfo.hp, points: 0});

			console.log("created at: " + ((new Date()).getTime()-startTime)+ "ms players: " + room.getPlayers().length);
		}
	}
	function getPlayersStartInfo(){
		var info = [];
		for(var i = 0; i < players.length; i++){
			info.push({id: players[i].socket.player.id, x:players[i].x, sprite: players[i].sprite});
		};
		return info;
	}
	///GAME
	function addBlocks(){
		var temp = [];
		for(var i = 0; i < 10; i++){
			var b = newBlock();
			blocks.push(b);
			temp.push(b);
		}
		return temp;
	}
	function newBlock(){
		var gap = getRandomInt(blockInfo.minGap, blockInfo.maxGap);
		var x = currentX + gap;
		var w = getRandomInt(blockInfo.minWidth, blockInfo.maxWidth);
		var type = getRandomInt(1, blockInfo.types +1);
		currentX = x+w;

		return new Block(x, gameInfo.gameY, w, blockInfo.height, type);
	}
	function startBlock(){
		var x = currentX;
		var w = 150;
		currentX = x+w;

		return new Block(x, gameInfo.gameY, w, blockInfo.height, 3);
	}
	function getPlayersAlive(){
		var n = 0;
		for(var i = 0; i < players.length; i++){
			if(!players[i].dead){
				n ++;
			}
		}
		return n;
	}
	function getPlayerId(id){
		for(var i = 0; i < players.length; i++){
			if(players[i].socket.player.id == id){
				return i;
			}
		}
		return -1;
	}
	function getPlayer(id){
		for(var i = 0; i < players.length; i++){
			if(players[i].socket.player.id == id){
				return players[i];
			}
		}
		return null;
	}

	///REQUESTS

	//RESPONSES
	this.onReady = function(){
		//TO DO
		if(state == STATE.ENDGAME || state == STATE.STARTGAME){
			var index = readyPlayers.indexOf(this.player.id);
			if(index == -1){
				readyPlayers.push(this.player.id);
				if(state == STATE.ENDGAME){
					room.emit("ready", {id: this.player.id});
				}
			}
		}
		console.log(state == STATE.STARTGAME ? "STATE: START GAME" : state == STATE.ENDGAME ? "STATE: END GAME" : "STATE: NONE " + state);

		if(state == STATE.STARTGAME && readyPlayers.length == room.getPlayers().length){
			state = STATE.GAME;
			room.emit("ready", {});
		}else if(state == STATE.ENDGAME && readyPlayers.length == room.getPlayers().length){
			state = STATE.LOBBY;
			room.game.startGame();
		}
	}
	this.onPlay = function(data){
		var player = getPlayer(data.id);
		console.log("PLAY s: " + (state == STATE.GAME) +" player: "+ (player != null) +" alive:"+ player.alive) ;
		if(state == STATE.GAME && player != null && player.alive){
			var cBlock = blocks[player.block];
			var block =  blocks[player.block+1];
			var gox;
			var success;
			var currentBlock = player.block;
			var alive = true;
			var x = player.x;

			if(cBlock.x + cBlock.w + data.power >= block.x && cBlock.x + cBlock.w + data.power <= block.x + block.w){
				success = true;
				gox = cBlock.x + cBlock.w + data.power - player.width /2;
				player.block++;
				player.x = gox;
				player.points++;
			}else if(cBlock.x + cBlock.w + data.power  > block.x + block.w){
				success = false;
				gox = cBlock.x + cBlock.w + data.power;
				player.hp--;
			}else{
				success = false;
				gox = -1;
				player.hp--;
			}

			if(player.hp == 0){
				player.alive = false;
				player.dead = false;
			}

			room.emit("onPlay", {id: player.socket.player.id, success: success, goX: gox, power: data.power, currentBlock: currentBlock, 
				x:x, hp: player.hp, alive: alive, points: player.points});

			//create new blocks
			if(player.block + 5 > blocks.length){
				room.emit("newBlocks", { blocks: addBlocks()});
			}
		}
	};
	this.onDead = function(data){
		var player = getPlayer(data.id);
		
		if(state == STATE.GAME && player!=null && !player.alive && !player.dead ){
			console.log("DEAD");
			player.dead = true;
		}

		if(getPlayersAlive() == 0){
			state = STATE.ENDGAME;
			readyPlayers = [];
			console.log("END GAME");
			var points = [];
			for(var i = 0; i < players.length; i++){
				points.push({id:players[i].socket.player.id, points:players[i].points});
			}
			room.emit("endGame", {points: points});
		}
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
