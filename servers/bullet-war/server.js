"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {});

var RoomsManager = require('./libs/rooms');
var Classes = require('./libs/classes');
var Player = Classes.Player;
var Bullet = Classes.Bullet;

http.listen(8005);
console.log("Bullet War Server started http://localhost:8005");

///Load game info


var manager = new RoomsManager(io, Game, 2);

function Game(room){
	var room = room;

	var deltaTime = 0;
	var currentTime =0;
	var startTime = (new Date()).getTime() + 90000;
	var oldTime = (new Date()).getTime();
	var timer = null;
	var playingTime = 0;
	var STATE = {LOBBY : 0, STARTGAME: 1, GAME: 2, ENDGAME:3};
	var state = STATE.LOBBY;

	var width = 900;
	var height = 1200;
	var middleY = height / 2;
	var middleX = width / 2;
	var playerW = 100;

	//GAME
	var players = [];
	var readyPlayers = [];
	var bullets;
	var destroyBullets = [];

	this.startGame = function(){
		if(state == STATE.LOBBY){
			playingTime = 0;
			currentTime = getTime();
			oldTime = getTime();
			deltaTime = (currentTime-oldTime) / 1000;
			bullets = 0;
			destroyBullets = [];
			players = [];
			readyPlayers = [];
			for(var i = 0; i < room.getPlayers().length; i++){
				var player = room.getPlayer(i);
				players.push(new Player(player, middleX, middleY * i + middleY/2, playerW, playerW, middleY * i, (middleY * i) + middleY,100, 350));
				//CLEAR EVENTS
				player.removeAllListeners("ready");
				player.removeAllListeners("move");
				player.removeAllListeners("shoot");
				//SET EVENTS
				player.on("ready", this.onReady);
				player.on("move", this.onMove);
				player.on("shoot", this.onShoot);
			}

			room.emit("startGame", {players: getPlayersStartInfo()});

			state = STATE.STARTGAME;
		}
	}
	function getPlayersStartInfo(){
		var info = [];
		for(var i = 0; i < players.length; i++){
			info.push({id: players[i].socket.player.id, x:players[i].x, y:players[i].y, width:players[i].width, height:players[i].height,
				minY: players[i].minY, maxY: players[i].maxY});
		};
		return info;
	}
	this.endGame = function(){
		clearInterval(timer);
	}

	var temp = 0;
	var bulletss = 0;


	function msToTime(duration) {
		var milliseconds = parseInt((duration%1000)/100)
		, seconds = parseInt((duration/1000)%60)
		, minutes = parseInt((duration/(1000*60))%60)
		, hours = parseInt((duration/(1000*60*60))%24);

		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;

		return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
	}

	function update(){
		currentTime = getTime();

		room.emit("time2", {time:currentTime});

		//console.log(currentTime + " " + msToTime(currentTime) + " " + msToTime(currentTime- startTime));

		deltaTime = (currentTime-oldTime) / 1000;
		bulletss = 0;
		for(var i =0; i < players.length; i++){
			var target = i == 0 ? players[1] : players[0];
			for(var j = 0; j <players[i].bullets.length; j++){
				bulletss++;
				var bullet = players[i].bullets[j];
				bullet.update(deltaTime);
				if(bullet.hit(target)){
					target.hp-=10;
					room.emit("hit", {id: target.socket.player.id, from: players[i].socket.player.id, hp: target.hp, bullet: bullet.id, x: bullet.x, y:bullet.y});
					destroyBullets.push({player: players[i], bullet: bullet}); 
				}
				if(bullet.y > height || bullet.y<0){
					destroyBullets.push({player: players[i], bullet: bullet});
				}
			}
		}
		for(var i =0; i < players.length; i++){
			players[i].update(deltaTime);
		}
		////DESTROY BULLETS
		for(var i =0; i < destroyBullets.length; i++){
			var index = destroyBullets[i].player.bullets.indexOf(destroyBullets[i].bullet);
			if(index != -1){
				destroyBullets[i].player.bullets.splice(index, 1);		
			}
		}

		if(destroyBullets.length>0){
			destroyBullets = [];
		}

		for(var i = 0; i< players.length; i++){
			//room.emit("position", {id: players[i].socket.player.id, x:players[i].x, y:players[i].y, action:players[i].action});
		}
		playingTime += deltaTime;		
		////////////////////////////
		oldTime = currentTime;

	}
	///CLIENT

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
		
		if(state == STATE.STARTGAME && readyPlayers.length == room.getPlayers().length){
			console.log("START GAME " + room.id);
			state = STATE.GAME;
			timer = setInterval(update, 1000 / 30);
			room.emit("ready", {});
		}else if(state == STATE.ENDGAME && readyPlayers.length == room.getPlayers().length){
			state = STATE.LOBBY;
			room.game.startGame();
		}
	}


	this.onMove = function(data){
		var p = getPlayer(this.player.id);
		if(p!=null){
			if(data.x <0){
				data.x = 0;
			}
			if(data.x > width){
				data.x = width;
			}
			if(data.y > p.maxY - p.height){
				data.y = p.maxY - p.height;
			}
			if(data.y < p.minY){
				data.y = p.minY;
			}

			p.goX = data.x;
			p.goY = data.y;
			p.action = "run";

			room.emit("move", {id: this.player.id, x:p.x, y:p.y, goX: data.x, goY: data.y, action:"run"});
		}
	}
	this.onPosition = function(data){
		//TO DO PREDICTIONS
		//START TIME CURRENT TIME ETC ..
		/*var p = getPlayer(data.id);
		if(p!=null){
			this.emit("position", {id: data.id, x:p.x, y:p.y, action:p.action});
		}*/
	}
	this.onShoot = function(data){
		var p = getPlayer(this.player.id);
		if(p!=null){
			var id = bullets;
			var x = p.x + p.width/2;
			var y = p.y+p.height/2;
			var w=10;
			var h = 10;
			var speed = p.minY == 0? 600 : -600;
			p.bullets.push(new Bullet(id, x,y,w,h,speed));
			bullets ++;
			room.emit("shoot", {id: this.player.id, bullet:id, x: x, y: y, w: w, h:h, speed: speed});
		}
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
}


//Classes
