"use strict";
var request = require('request');
var host = "http://localhost:2000/";

function RoomManager(io, gameInstance, minPlayers, maxPlayers){
	console.log("\n\nRoom Created \n\n");
	var room = this;
	var sockets = [];
	var rooms = [];
	var minPlayers = minPlayers;
	var maxPlayers = maxPlayers;
	var io = io;
	var gameInstance = gameInstance;

	function connection(socket){
		console.log("[ ] Connect " + socket.id);
		sockets.push(socket);
		socket.room = null;
		socket.player = null;
		socket.on("disconnect", removePlayer);
		socket.on("login", login);
		//room
		socket.on("quickRoom", quickRoom);
		socket.on("createRoom", createRoom);
		socket.on("joinRoom", joinRoom);
		socket.on("exitRoom", exitRoom);
		//
		socket.on("startGame", startGame);
		//teste
		socket.on("socketList", function(){
			for(var i = 0; i < sockets.length; i++){
				this.emit("newSocket", {id: sockets[i].id, name: sockets[i].player.username});
			}
		})

		socket.on("allRoomsList", function(){
			for(var i = 0; i < rooms.length; i++){
				this.emit("newRoom", {id: rooms[i].id, players : rooms[i].getPlayersNames()});
			}
		})

		socket.on("roomsList", roomsList);

		//socket.emit("you", {name: socket.name});
	}

	function login(data){
		var _self = this;
		request.post(
			host + 'api/checkLogin',
			{ json: { token: data.token } },
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					if(body.success){ 
						//_self.name = body.id;
						if(!isUserOnline(body.id)){
							_self.player = {id : body.id, username : body.username, avatar : "/uploads/" + body.avatar, country : body.country};
							_self.emit("you", body);
							console.log("[ ] LOGIN -> " + body.username);
						}else{
							_self.emit("you", {success: false, error:1});
						}
					}else{
						_self.emit("you", {success: false , error:0});
					}
				}
			}
			);
	}
	function isUserOnline(id){
		var size = sockets.length;
		for(var i = 0; i < size; i++){
			if(sockets[i].player != null && sockets[i].player.id == id)
				return true;
		}
		return false;
	}

	function createRoom(data){
		if(this.room == null && this.player!=null){
			var room = new Room(io, uniqid(), minPlayers, maxPlayers);
			rooms.push(room);
			this.room = room;
			this.room.addPlayer(this);
			this.emit("joinRoom", {id: this.room.id});
			this.emit("newPlayer", this.player);
		}
	}

	function joinRoom(data){
		var index = getRoomById(data.id);
		if(index != -1 && this.room==null && this.player != null){
			if(!rooms[index].hasGame() && rooms[index].addPlayer(this)){
				this.room = rooms[index]; 
				this.emit("joinRoom", {id: this.room.id});

				var players = this.room.getPlayers();
				for(var i = 0; i < players.length; i++){
					if(players[i]!=this){
						this.emit("newPlayer", players[i].player);
					}
					players[i].emit("newPlayer", this.player);
				}
			}
		}
	}

	function exitRoom(){
		if(this.room != null && this.player != null){
			removePlayerRoom(this.room, this);
			this.room = null;
			this.emit("exitRoom", {state : true});
		}
	}

	function roomsList(){
		for(var i = 0; i < rooms.length; i++){
			if(!rooms[i].hasGame() && !rooms[i].isFull())
				this.emit("room", rooms[i].getInfo());
		}
	}

	function quickRoom(){
		if(this.room == null && this.player !=null){
			var found = false;
			for(var i = 0; !found && i < rooms.length; i++){
				if(!rooms[i].hasGame() && !rooms[i].isFull()){
					this.emit("quickRoom", rooms[i].getInfo());
					found = true;
				}
			}
			if(!found){
				this.emit("quickRoom", {success: false});
			}
		}
	}

	function removePlayerRoom(room, player){
		if(room != null){
			room.removePlayer(player);

			if(room.isEmpty()){
				removeRoom(room);
			}else{
				var players = room.getPlayers();
				for(var i = 0; i < players.length; i++){
					players[i].emit("removePlayer", {id: player.player.id});
				}
			}
		}
	}

	function getRoomById(id){
		for(var i = 0; i < rooms.length; i++){
			if(rooms[i].id == id)
				return i;
		}
		return -1;
	}

	function removePlayer(){
		var index = sockets.indexOf(this);
		if(index != -1){
			console.log("[X] Disconnected " + sockets[index].id);
			removePlayerRoom(this.room, this);
			sockets.splice(index, 1);
		}
	}

	function removeRoom(room){
		var index = rooms.indexOf(room);
		if(index != -1){

			if(room.game){
				if(room.game.endGame){
					console.log("END GAME");
					room.game.endGame();
				}
			}
			rooms.splice(index, 1);
		}
	}

	function startGame(){
		if(this.room.getPlayers().length >= minPlayers){
			for(var i = 0; i < this.room.getPlayers().length; i++){
				this.room.getPlayers()[i].join(this.room.id);
			}

			this.room.game = new gameInstance(this.room);
			this.room.game.startGame();
		}
		//TO DO SEND ERROR
	}


	this.getID = function(){
		return id;
	}

	this.getSockets= function(){
		return sockets;
	}

	io.sockets.on("connection", connection);
}

function Room(io, id, minPlayers, maxPlayers){
	this.io = io;
	this.id = id;
	this.game = null;

	var players = [];
	var maxPlayers = maxPlayers;
	var minPlayers = minPlayers;

	this.addPlayer = function(socket){
		if(this.isFull()){
			return false;
		}
		players.push(socket);
		return true;
	}

	this.removePlayer = function(socket){
		var index = players.indexOf(socket);
		if(index != -1){
			var name = players[index].player.id;
			players.splice(index, 1);
			if(this.game != null){
				this.emit("userDisconnect", {id: name});
			}
			if(this.game != null && this.game.onDisconnect !=null){
				this.game.onDisconnect(name);
			}
		}
	}
	this.hasGame = function(){
		return this.game != null;
	}
	this.isFull = function(){
		return maxPlayers <= players.length;
	}

	this.isEmpty = function(){
		return players.length == 0;
	}
	this.getMinPlayers = function(){
		return minPlayers;
	}
	this.getPlayersId = function(){
		var names = [];
		for(var i = 0; i < players.length; i++){
			names.push(players[i].player.id);
		}
		return names;
	}
	this.getPlayersNames = function(){
		var names = [];
		for(var i = 0; i < players.length; i++){
			names.push(players[i].player.username);
		}
		return names;
	}

	this.getInfo = function(){
		return {success: true, id: this.id, players : this.getPlayersNames(), max : maxPlayers};
	}

	this.getPlayers = function(){
		return players;
	}
	this.getPlayer = function(i){
		return players[i];
	}

	this.getPlayerIndex = function (player){
		for(var i = 0; i < players.length; i++){
			if(players[i] == player){
				return i;
			}
		}
		return -1;
	}

	this.emit = function(call, data){
		this.io.to(this.id).emit(call, data);
	}
}

function uniqid(){
	return Math.random().toString(36).substr(2, 9) + new Date().valueOf();
}

module.exports = RoomManager;