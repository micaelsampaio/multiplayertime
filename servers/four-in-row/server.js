"use strict";

var express = require('express');
var colors = require('colors/safe')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {transports: ['websocket']});

var RoomsManager = require('../rooms');

http.listen(8004);
console.log(colors.cyan(`
	+-----------------------------------------------------+
	|                                                     |
	|                4 IN A ROW                           |
	|                                                     |
	|       Server at:   http://localhost:8004            |
	|                                                     |
	+-----------------------------------------------------+
`));

///Load game info
var manager = new RoomsManager(io, Game, 2, 2);

function Game(room){
	var room = room;
	var players;
	
	var horizontal = 7;
	var vertical = 6;
	var map = [];
	var currentPlayer = 0;

	var STATE = {LOBBY : 0, STARTGAME: 1, GAME: 2, ENDGAME: 3 };
	var state = STATE.LOBBY;
	var readyPlayers = [];
	var points = [];
	var timer = null;
	var maxTime = 10000;

	this.startGame = function(){
		if(state == STATE.LOBBY){
			state = STATE.STARTGAME;
			var startTime = (new Date()).getTime();
			//restart variables

			for(var i = 0; i < vertical; i++){
				map[i] = [];
				for(var j = 0; j <horizontal; j++){
					map[i][j] = 2;
				}
			}
			if(timer!= null)
				clearTimeout(timer);

			players = [];
			readyPlayers = [];
			currentPlayer = getRandomInt(0,2);
			
			for(var i = 0; i < room.getPlayers().length; i++){
				var player = room.getPlayer(i);
				players.push(player);
				//CLEAR EVENTS
				player.removeAllListeners("ready");
				player.removeAllListeners("play");
				//SET EVENTS
				player.on("ready", this.onReady);
				player.on("play", this.onPlay);
				points[i] = points[i] || 0;
			}

			//send info
			room.emit("startGame", {players: getPlayersStartInfo(), map: map, currentPlayer: currentPlayer});
			timer = setTimeout(playerTimeout, maxTime + 2000);
			console.log("created at: " + ((new Date()).getTime()-startTime)+ "ms players: " + room.getPlayers().length);
		}
	}
	function getPlayersStartInfo(){
		var info = [];
		for(var i = 0; i < players.length; i++){
			info.push({id: players[i].player.id, type: i, points: points[i]});
		};
		return info;
	}
	///GAME
	
	function getPlayerId(id){
		for(var i = 0; i < players.length; i++){
			if(players[i].player.id == id){
				return i;
			}
		}
		return -1;
	}
	function getPlayer(id){
		for(var i = 0; i < players.length; i++){
			if(players[i].player.id == id){
				return players[i];
			}
		}
		return null;
	}
	function getRow(column){
		for(var i = vertical-1; i >=0; i--){
			if(map[i][column] == 2){
				return i;
			}
		}
		return -1;
	}
	function isFull(){
		for(var i = 0; i < horizontal; i++){
			if(map[0][i] == 2){
				return false;
			}
		}
		return true;
	}
	function checkWin(row, col, player) {
		return checkHorizontally(row, col, player) || checkVertically(row, col, player) || checkDiagonally1(row,col,player) || checkDiagonally2(row,col,player);
	}
	function getWin(row, col, player) {
		var vertices;

		vertices = getHorizontally(row, col, player);
		if(vertices.length>=4){
			console.log(vertices);
			vertices.splice(4, vertices.length - 4);
			return vertices;
		}
		vertices = getVertically(row, col, player);
		if(vertices.length>=4){
			vertices.splice(4, vertices.length - 4);
			return vertices;
		}
		vertices = getDiagonally1(row, col, player);
		if(vertices.length>=4){
			vertices.splice(4, vertices.length - 4);
			return vertices;
		}
		vertices = getDiagonally2(row, col, player);
		if(vertices.length>=4){
			vertices.splice(4, vertices.length - 4);
			return vertices;
		}
		return [];
	}

	function checkHorizontally(row,col, player){
		var adjacentSameTokens = 1;
		var i = 1;
		while (col - i >= 0 && map[row][col - i] == player)
		{
			adjacentSameTokens++;
			i++;
		}

		i = 1;
		while (col + i < horizontal && map[row][col + i] == player)
		{
			adjacentSameTokens++;
			i++;
		}
		return (adjacentSameTokens >= 4);
	}

	function getHorizontally(row,col, player){
		var vertices = [];
		var i = 1;
		vertices.push({row: row, col: col});
		while (col - i >= 0 && map[row][col - i] == player)
		{
			vertices.push({row: row, col: col-i});
			i++;
		}

		i = 1;
		while (col + i < horizontal && map[row][col + i] == player)
		{
			vertices.push({row: row, col: col+i});
			i++;
		}
		
		return vertices;
	}
	
	function checkVertically(row, col, player){
		var adjacentSameTokens = 1;
		var i = 1;
		while (row + i < vertical && map[row + i][col] == player)
		{
			adjacentSameTokens++;
			i++;
		}
		return (adjacentSameTokens >= 4);
	}

	function getVertically(row, col, player){
		var vertices = [];
		var i = 1;
		vertices.push({row: row, col: col});
		while (row + i < vertical && map[row + i][col] == player)
		{
			vertices.push({row: row+i, col: col});
			i++;
		}
		return vertices;
	}

	function checkDiagonally1(row, col, player){
		for (var j = 0; j < 4; j++)
		{
			var adjacentSameTokens = 0;
			for (var i = 0; i < 4; i++)
			{
				if ((col + i - j) >= 0 && (col + i - j) < horizontal
					&& (row + i - j) >= 0 && (row + i - j) < vertical
					&& map[row + i - j][col + i - j] == player)
				{
					adjacentSameTokens++;
				}
			}
			if (adjacentSameTokens >= 4)
				return true;
		}
		return false;
	}
	function getDiagonally1(row, col, player){
		for (var j = 0; j < 4; j++)
		{

			var vertices = [];
			for (var i = 0; i < 4; i++)
			{
				if ((col + i - j) >= 0 && (col + i - j) < horizontal
					&& (row + i - j) >= 0 && (row + i - j) < vertical
					&& map[row + i - j][col + i - j] == player)
				{
					vertices.push({row: row + i - j, col: col + i - j});
				}
			}
			if (vertices.length >= 4)
				return vertices;
		}
		return [];
	}
	function checkDiagonally2(row, col, player){
		for (var j = 0; j < 4; j++)
		{
			var adjacentSameTokens = 0;
			for (var i = 0; i < 4; i++)
			{
				if ((col - i + j) >= 0 && (col - i + j) < horizontal
					&& (row + i - j) >= 0 && (row + i - j) < vertical
					&& map[row + i - j][col - i + j] == player)
				{
					adjacentSameTokens++;
				}
			}
			if (adjacentSameTokens >= 4)
				return true;
		}
		return false;
	}
	function getDiagonally2(row, col, player){
		for (var j = 0; j < 4; j++)
		{
			var vertices = [];
			for (var i = 0; i < 4; i++)
			{
				if ((col - i + j) >= 0 && (col - i + j) < horizontal
					&& (row + i - j) >= 0 && (row + i - j) < vertical
					&& map[row + i - j][col - i + j] == player)
				{
					vertices.push({row: row + i - j, col: col - i + j});
				}
			}
			if (vertices.length >= 4)
				return vertices;
		}
		return [];
	}
	///REQUESTS

	//RESPONSES
	this.endGame = function(){
		clearTimeout(timer);
	}
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
		var index = getPlayerId(this.player.id);
		console.log("PLAY " + (state == STATE.GAME) + " &&  " + (currentPlayer == index) +" " + currentPlayer + " - " + index + " s:" + state);
		if(state == STATE.GAME && currentPlayer == index){
			
			var row = getRow(data.col);
			var player = currentPlayer;
			clearTimeout(timer);

			if(row!=-1){
				map[row][data.col] = currentPlayer;
				
				currentPlayer = currentPlayer == 0 ? 1: 0;

				room.emit("onPlay", {id: this.player.id, row: row, col: data.col, player: map[row][data.col], currentPlayer: currentPlayer});
				timer = setTimeout(playerTimeout, maxTime + 2000);

				if(checkWin(row, data.col, player) == true){
					clearTimeout(timer);
					var vertices = getWin(row, data.col, player);
					console.log("END GAME");
					state = STATE.ENDGAME;
					readyPlayers = [];
					points[player]++;
					room.emit("endGame", {players: getPlayersStartInfo(), winner: players[player].player.id, vertices: vertices});
				}else if(isFull()){
					clearTimeout(timer);
					console.log("END GAME");
					readyPlayers = [];
					state = STATE.ENDGAME;
					room.emit("endGame", {players: getPlayersStartInfo(), winner: -1});
				}
			}
		}
	};
	function playerTimeout(){
		console.log("TIMER ");
		room.emit("userDisconnect", {id: null});
	}
}



function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
