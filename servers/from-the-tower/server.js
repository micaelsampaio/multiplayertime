"use strict";

var express = require('express');
var colors = require('colors/safe')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {transports: ['websocket']});

var RoomsManager = require('../rooms');
var Player = require('./classes').Player;
var Block = require('./classes').Block;

http.listen(8003);
console.log(colors.blue(`
	+-----------------------------------------------------+
	|                                                     |
	|                FROM THE TOWER                       |
	|                                                     |
	|       Server at:   http://localhost:8003            |
	|                                                     |
	+-----------------------------------------------------+
`));

///Load game info
var towerY = 500;
var towerW = 135;
var towerH = 500;
var towerX = (450 / 2) - towerW/2;
var blockW = 130;
var blockH = 20;
var startY = 500;
var offsetY = blockH + 100;
var blockPos = [towerX-blockW, towerX+towerW];
//var pos = [towerX - 80 - 65, towerX + towerW + 80];

var playerWidth = 65;
var playerHeight = 65;
var hp= 2;

//
var manager = new RoomsManager(io, Game, 1, 3);

function Game(room){
	var room = room;
	var players;
	var readyPlayers;
	var blocks;
	var currentX = 0;
	var startX = 0;
	var currentBlockId = 0;
	var pos = [];
	var STATE = {LOBBY : 0, STARTGAME: 1, GAME: 2, ENDGAME: 3 };
	var state = STATE.LOBBY;

	this.startGame = function(){
		if(state == STATE.LOBBY){
			readyPlayers = [];
			state = STATE.STARTGAME;
			var startTime = (new Date()).getTime();
			//restart variables
			players = [];
			blocks = [];
			
			for(var i = 0; i < 9; i++){
				blocks.push(newBlock());
			}
			//player info
			var blockPlayer = blockW / room.getPlayers().length;

			for(var i = 0; i < room.getPlayers().length; i++){
				var player = room.getPlayer(i);
				players.push(new Player(player, 0,0,
					playerWidth, playerHeight, "jump", hp, blocks[0], [blockPos[0] + blockPlayer * i+1, blockPos[1] + blockPlayer * i+1]));
				setPlayerPos(players[i]);
				player.removeAllListeners("play");
				player.removeAllListeners("ready");
				player.on("play", this.onPlay);
				player.on("ready", this.onReady);
			}
			
			var towers = [];
			for(var i = 0; i < 15; i++){
				towers.push(getRandomInt(0, 3));
			}
			//send info
			room.emit("startGame", {players: getPlayersStartInfo(), playerWidth:playerWidth, playerHeight:playerHeight,
				blocks: blocks, hp: hp, points: 0, towers: towers, towerWidth: towerW, towerHeight: towerH});

			console.log("created at: " + ((new Date()).getTime()-startTime)+ "ms");
		}
	}
	function getPlayersStartInfo(){
		var info = [];
		for(var i = 0; i < players.length; i++){
			info.push({id: players[i].socket.player.id, x:players[i].x, y:players[i].y, sprite: players[i].sprite, block:0});
		};
		return info;
	}
	///GAME
	function getBlock(id){
		for(var i = 0; i< blocks.length; i++){
			if(blocks[i].id == id){
				return blocks[i];
			}
		}
		return null;
	}
	function getBlockIndex(id){
		for(var i = 0; i< blocks.length; i++){
			if(blocks[i].id == id){
				return i;
			}
		}
		return -1;
	}
	function newTower(){
		var type = getRandomInt(1,3);
		var y = towerY;
		towerY -= towerH;
		return new Block(id, type, x, startY - offsetY * id, blockW, blockH, "brown");
	}
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
		var type = getRandomInt(0,2);
		var x = type == 1 ? towerX+towerW : towerX-blockW;
		var id = currentBlockId;
		currentBlockId++;

		return new Block(id, type, x, startY - offsetY * id, blockW, blockH, "brown");
	}
	function startBlock(){
		var x = currentX;
		var w = 150;
		currentX = x+w;

		return new Block(x, gameInfo.gameY, w, blockInfo.height, "black");
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
	function setPlayerPos(player){
		player.x = player.pos[player.block.type];
		player.y = player.block.y - player.width;
	}
	function getLastPlayer(){
		var last = players[0];
		for(var i = 0; i < players.length; i++){
			if(players[i].y < last.y){
				last = players[i];
			}
		}
		return last;
	}
	function getPlayersAlive(){
		var n = 0;
		for(var i = 0; i < players.length; i++){
			if(players[i].alive){
				n ++;
			}
		}

		return n;
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
					room.emit("ready", {id: this.player.id, state: true});
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
		var player = getPlayer(this.player.id);
		console.log("PLAY") ;
		if(state == STATE.GAME && player && player.canPlay && player.alive){
			
			var currentBlock = player.block;
			var index = getBlockIndex(player.block.id+1)
			player.block = blocks[index];
			var success = false;
			var scale = 1;
			
			if(data.type == player.block.type){	
				setPlayerPos(player);
				success = true;
				player.points++;
				scale = player.block.type == 0 ? 1: -1;

				console.log("SUCESS px:" + player.x + " bx:" + player.block.x + " bt:" + player.block.type + " pos:" + player.pos);
			}else{
				setPlayerPos(player);
				success = false;
				player.hp--;
				scale = data.type == 0 ? 1: -1;
				player.x = player.pos[data.type];
				console.log("FAIL px:" + player.x + " bx:" + currentBlock.x + " bt:" + currentBlock.type + " pos:" + player.pos);
			}

			if(player.hp <=0){
				player.hp = 0;
				player.alive = false;
			}

			room.emit("onPlay", {id: player.socket.player.id, success: success, x: player.x, y: player.y, nx:player.pos[player.block.type], scale: scale, 
				nextBlock: player.block.id, points: player.points, hp:player.hp});
			console.log("EMIT") ;
			
			//create new blocks
			if(index + 5 > blocks.length){
				room.emit("newBlocks", { blocks: addBlocks()});
			}

			if(getLastPlayer() == player){
				//console.log("DESTROY Block " + currentBlock.id);
				//TO DO
			}

			if(getPlayersAlive() <= 0){
				state = STATE.ENDGAME;
				readyPlayers = [];

				var points = [];
				for(var i = 0; i < players.length; i++){
					points.push({id:players[i].socket.player.id, points:players[i].points});
				}

				room.emit("endGame", {points: points});
				console.log("END GAME");
			}
		}
	};

}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
//Classes
