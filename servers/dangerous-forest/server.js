"use strict";

var express = require('express');
var colors = require('colors/safe')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {transports: ['websocket']});

var RoomsManager = require('../rooms');
var Player = require('./classes').Player;
var Block = require('./classes').Block;

http.listen(8007);
console.log(colors.yellow(`
	+-----------------------------------------------------+
	|                                                     |
	|                DANGEROUS FOREST                     |
	|                                                     |
	|       Server at:   http://localhost:8007            |
	|                                                     |
	+-----------------------------------------------------+
`));
var playerWidth = 50;
var playerHeight = 50;

var width = 450;
var height = 600;

var blockW = 50;
var blockH = 50;

var manager = new RoomsManager(io, Game, 1, 3);
var TYPE = {rock : 0, hp: 1, coin: 2};
var STATE = {LOBBY : 0, STARTGAME: 1, GAME: 2, ENDGAME: 3 };

function Game(room){
	var room = room;
	var players;
	var readyPlayers;
	var blocks;
	
	var state = STATE.LOBBY;
	
	var currentTime = 0;
	var oldTime = 0;
	var deltaTime = 0;
	var timer;
	var send = 0;
	var nextBlock = 2;
	var blockTime = 0;
	var currentBlockId = 0;
	var endTime = 0;
	var points = 0;
	this.startGame = function(){
		if(state == STATE.LOBBY){
			var startTime = (new Date()).getTime();

			readyPlayers = [];
			state = STATE.STARTGAME;
			
			//restart variables
			players = [];
			blocks = [];
			send = 100;
			blockTime = 33330;
			nextBlock = 2;
			currentBlockId = 0;
			endTime = 0;
			points = 0;
			//TODO CREATE BOLOCK
			/*for(var i = 0; i < 20; i++){
				blocks.push(newBlock());
			}*/

			for(var i = 0; i < room.getPlayers().length; i++){
				var player = room.getPlayer(i);
				players.push(new Player(player, ((width / 2)*(i +1)) /2 ,  playerHeight / 2, 
					playerWidth, playerHeight, "police", {left: 20, top: 20, bottom: height - playerHeight, right: width- playerWidth - 20}));
				player.removeAllListeners("move");
				player.removeAllListeners("ready");
				player.on("move", this.onMove);
				player.on("ready", this.onReady);
			}

			//send info
			room.emit("startGame", {players: getPlayersStartInfo(), playerWidth:playerWidth, playerHeight:playerHeight, blocks: blocks});

			console.log("created at: " + ((new Date()).getTime()-startTime)+ "ms");
		}
	}
	function update(){
		currentTime = (new Date()).getTime();
		deltaTime = (currentTime - oldTime) / 1000;
		
		points += deltaTime;
		var playersInfo = [];
		var blocksInfo = [];
		var alive = 0;

		for(var i = 0; i< blocks.length; i++){
			blocks[i].update(deltaTime)
			blocksInfo.push(blocks[i].getUpdateInfo(currentTime));
			

			//checkCollision(players[i]);

			if(blocks[i].y + blockH < -blockH){
				blocks.splice(i, 1);
				i--;
			}
			
		}

		for(var i = 0; i< players.length; i++){
			players[i].update(deltaTime);

			if(players[i].alive)
				checkCollision(players[i]); 

			if(!players[i].dead){
				alive++;
			}
			playersInfo.push(players[i].getUpdateInfo(currentTime));
		}

		if(getPlayersAlive() == 0){
			endTime+= deltaTime;

			if(endTime > 1){
				endGame();
			}
		}

		send += deltaTime;
		if(send > 0.05){
			send = 0;
			room.emit("update", {players: playersInfo, t: currentTime, blocksInfo: blocksInfo, points: Math.ceil(points)});
		}

		blockTime += deltaTime;

		if(blockTime > nextBlock){
			blockTime = 0;
			nextBlock = getRandomInt(1, 2);
			var rand = getRandomInt(0, 5);
			var limit = width / rand;

			for(var i = 0; i < rand; i++){
				var b = newBlock();
				blocks.push(b);
				var type = getRandomInt(0, 1000);
				if(type>500 && type < 510){
					b.type = TYPE.hp;
				}
				else if(type>700 && type < 750){
					b.type = TYPE.coin;
				}
				else{
					b.type = TYPE.rock;
				}
				b.x = getRandomInt(limit * i, limit * (i+1) - blockW);
				room.emit("newBlock", {id: b.id, x:b.x  , y: b.y , w:b.w,h:b.h, type: b.type});
			}
		}
		oldTime = currentTime;

		if(alive == 0){
			endGame();
		}
	}

	function checkCollision(player){
		var x1 = player.x + 10;
		var y1 = player.y + 15;
		var w1 = player.width - 10;
		var h1 = player.height - 25;
		
		for(var i = 0; i< blocks.length; i++){
			var x2 = blocks[i].x +10;
			var y2 = blocks[i].y +10;
			var w2 = blocks[i].w - 10;
			var h2 = blocks[i].h - 10;

			if(x1 + w1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 <= y2 + h2){
				if(blocks[i].type == TYPE.rock){
					//player.die();
					player.hit(points);
				}
				if(blocks[i].type == TYPE.hp){
					//player.die();
					player.addHP();
				}
				if(blocks[i].type == TYPE.coin){
					//player.die();
					player.addCoin();
				}
				

				
				room.emit("hit", {t: currentTime, id: blocks[i].id, type: blocks[i].type});
				blocks.splice(i, 1);
				return;
			}
		}

		//  return ((r1.X + r1.Width >= r2.X) and (r1.X <= r2.X + r2.Width) and (r1.Y + r1.Height >= r2.Y) and (r1.Y <= r2.Y + r2.Height));
		
		//down

	}
	function endGame(){
		readyPlayers = [];
		state = STATE.ENDGAME;
		clearInterval(timer);
		timer = null;
		var info = [];
		for(var i = 0; i < players.length; i++){
			info.push({points: players[i].points, coin: players[i].coin});
		}
		room.emit("endGame", {info:info});
	}
	this.endGame = function(){
		console.log("End Game room:"+ room.id);
		clearInterval(timer);
		timer = null;
	}
	function getPlayersStartInfo(){
		var info = [];
		for(var i = 0; i < players.length; i++){
			info.push({id: players[i].socket.player.id, x:players[i].x, y:players[i].y, sprite: players[i].sprite, block: 0});
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
		//TODO
		var id = currentBlockId;
		currentBlockId++;

		return new Block(id, 0, height + 50, blockW, blockH);
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
	
	function getPlayersAlive(){
		var n = 0;
		for(var i = 0; i < players.length; i++){
			if(!players[i].dead){
				n ++;
			}
		}

		return n;
	}

	//play card client
	this.onDisconnect = function(id){
		console.log("DISCONNECT " + id);
		var index = getPlayerId(id);
		if(index != -1){
			//players[index] = null;

			if(state == STATE.ENDTURN){
				var index2 = readyPlayers.indexOf(id);
				if(index2 != -1){
					readyPlayers.splice(index2,1);
				}
				room.emit("readyPlayers", {player: index, state: false});
				checkReady();
			}
		}
		
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
			currentTime = (new Date()).getTime();
			oldTime = (new Date()).getTime();
			if(timer == null) 
				timer = setInterval(update, 1000 / 30);


			room.emit("ready", {});
		}else if(state == STATE.ENDGAME && readyPlayers.length == room.getPlayers().length){
			state = STATE.LOBBY;
			room.game.startGame();
		}
	}
	this.onMove = function(data){
		var player = getPlayer(this.player.id);
		if(state == STATE.GAME && player){
			player.addInput({x:data.x, y:data.y});
		}
	}
	
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
//Classes