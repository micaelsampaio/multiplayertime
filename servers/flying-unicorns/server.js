"use strict";

var express = require('express');
var colors = require('colors/safe')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {transports: ['websocket']});

var RoomsManager = require('../rooms');
var Player = require('./classes').Player;
var Block = require('./classes').Block;

http.listen(8006);
console.log(colors.magenta(`
	+-----------------------------------------------------+
	|                                                     |
	|                FLYING UNICORNS                      |
	|                                                     |
	|       Server at:   http://localhost:8006            |
	|                                                     |
	+-----------------------------------------------------+
`));


var playerWidth = 50;
var playerHeight = 50;
var width = 450;
var height = 600;
var floor = 150;
var gap = 80;
var blockW = 70;
var blockH = 350;
var startBlockX = 400;
var offsetX = 270;
//
var manager = new RoomsManager(io, Game, 2, 2);

function Game(room){
	var room = room;
	var players;
	var readyPlayers;
	var blocks;
	
	var currentBlockId = 0;

	var currentX = 0;
	var startX = 0;

	var STATE = {LOBBY : 0, STARTGAME: 1, GAME: 2, ENDGAME: 3 };
	var state = STATE.LOBBY;
	var timer;
	
	var currentTime = 0;
	var oldTime = 0;
	var deltaTime = 0;
	var serverTime = 0;
	var endTime = 0;

	var send = 0;

	this.startGame = function(){
		if(state == STATE.LOBBY){
			currentBlockId = 0;
			readyPlayers = [];
			state = STATE.STARTGAME;
			var startTime = (new Date()).getTime();
			//restart variables
			players = [];
			blocks = [];

			serverTime = 0;
			endTime = 0;

			for(var i = 0; i < 20; i++){
				blocks.push(newBlock());
			}

			for(var i = 0; i < room.getPlayers().length; i++){
				var player = room.getPlayer(i);
				players.push(new Player(player, i* -80,height/2 - playerHeight/2, 
					playerWidth, playerHeight, "unicorn", {minY: 0, maxY:height-floor -playerHeight/2},blocks[0]));

				player.removeAllListeners("jump");
				player.removeAllListeners("ready");
				player.on("jump", this.onJump);
				player.on("ready", this.onReady);
			}

			//send info
			room.emit("startGame", {players: getPlayersStartInfo(), playerWidth:playerWidth, playerHeight:playerHeight, blocks: blocks, floor: floor, gap:gap});

			console.log("created at: " + ((new Date()).getTime()-startTime)+ "ms");
		}
	}
	function update(){
		currentTime = (new Date()).getTime();
		deltaTime = (currentTime - oldTime) / 1000;
		serverTime += deltaTime;

		var playersInfo = [];

		for(var i = 0; i< players.length; i++){
			players[i].update(deltaTime);

			checkCollision(players[i]);

			playersInfo.push({x: players[i].x, y: players[i].y, rotation: players[i].rotation, 
				jump: players[i].jumping, t: serverTime, dead: players[i].dead,
				alive: players[i].alive, points: players[i].points});
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
			room.emit("update", {players: playersInfo, t: serverTime});
		}
		oldTime = currentTime;
	}
	function checkCollision(player){
		var x1 = player.x + 12;
		var y1 = player.y + 12;
		var w1 = player.width - 25;
		var h1 = player.height - 25;
		
		var x2 = player.block.x;
		var y2 = player.block.y;
		var w2 = player.block.w;
		var h2 = player.block.h;

		var y3 = y2 - gap - h2;
		//down
		
		if(player.alive && x1 + w1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 <= y2 + h2){
			player.die();
			console.log("HIT");
		}
		if(player.alive && x1 + w1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y3 && y1 <= y3 + h2){
			player.die();
			console.log("HIT");
		}

		if(x1 > x2+w2){
			if(player.alive)
				player.points++;
			player.block = getBlock(player.block.id + 1);
		}

		//  return ((r1.X + r1.Width >= r2.X) and (r1.X <= r2.X + r2.Width) and (r1.Y + r1.Height >= r2.Y) and (r1.Y <= r2.Y + r2.Height));
		
		//down

	}
	function endGame(){
		readyPlayers = [];
		state = STATE.ENDGAME;
		clearInterval(timer);
		room.emit("endGame", {});
	}
	this.endGame = function(){
		console.log("End Game room:"+ room.id);
		clearInterval(timer);
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
		var y = height - (floor + blockH - getRandomInt(0, blockH - 50));
		currentBlockId++;

		return new Block(id, startBlockX + offsetX * id, y, blockW, blockH);
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
			timer = setInterval(update, 1000 / 30);
			room.emit("ready", {});
		}else if(state == STATE.ENDGAME && readyPlayers.length == room.getPlayers().length){
			state = STATE.LOBBY;
			room.game.startGame();
		}
	}
	this.onJump = function(data){
		var player = getPlayer(this.player.id);
		if(state == STATE.GAME && player){
			player.addInput("jump");
		}
	}
	this.onPlay = function(data){
		var player = getPlayer(this.player.id);
		console.log("PLAY") ;
		if(state == STATE.GAME && player && player.canPlay && player.alive){
			/*
			var currentBlock = player.block;
			var index = getBlockIndex(player.block.id+1)
			player.block = blocks[index];
			var success = false;
			

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

			*/
		}
	};

}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
//Classes
