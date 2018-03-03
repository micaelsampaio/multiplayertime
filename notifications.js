"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var auth = require('./api/config/authentication');
var io = require('socket.io')(http, {});

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/multiplayer_time_database', { useMongoClient: true });

var Invite =  require('./api/models/invite');
var Friend =  require('./api/models/friend');

var sockets = [];

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

http.listen(9000);

console.log("MAGIC NOTIFICATIONS STUFF http://localhost:9000");

io.on('connection', function (socket) {
	socket.userid = null;
	socket.notifications = 0;
	socket.on("login", onLogin);
	socket.on('disconnect', onDisconnect);
});

function onDisconnect(){
	if(this.userid != null){
		var id = sockets.indexOf(this);
		if(id!= -1){
			sockets.splice(id, 1);
		}
	}
}
function onLogin(data){
	var socket = this;
	jwt.verify(data.token,auth.secret, function(err, decoded) {
		if(err){
			socket.userid = null;
		}else{
			socket.notifications = 0;
			socket.userid = decoded.userid;
			socket.on("notifications", onNotifications);
			sockets.push(socket);
			sendNotifications(socket);
		}
	});
}
function notify(user){
	if(user!= null){
		var list = getSocketsById(user);
		for(var i = 0; i < list.length; i++){
			list[i].notifications++;
			list[i].emit("notify");
		}
	}
}

function onNotifications(){
	sendNotifications(this);
}

function sendNotifications(socket){
	var notifications = {friends: [], invites: [], notifications: socket.notifications};
	Invite.find({you: socket.userid}).populate("users").populate("games").exec( function(err, invites) {
		if(!err && invites != null){
			for(var i = 0; i < invites.length; i++){
				notifications.invites.push(inviteToResult(invites[i])); 
			}
		}
		Friend.find({friend: socket.userid, accepted: false}).populate("users").exec( function(err, users) {
			if(!err && users != null){
				for(var i = 0; i < users.length; i++){
					notifications.friends.push(userToResult(users[i].user));
				}
			}

			socket.emit("notifications", notifications);

		});
	});

}

function getSocketsById(userid){
	var result = [];
	var size = sockets.length;
	for(var i = 0; i< size; i++){
		if(userid == sockets[i].userid){
			result.push(sockets[i]);
		}
	}
	return result;
}

app.get('/notify/:id', function(req, res){
	var token = req.get("Authorization"); 
	jwt.verify(token, auth.secret, function(err, decoded) {
		if(err){
			res.json({success: false});
		}else{
			notify(req.params.id);
			res.json({success: true});
		}
	});
	
});

app.get('/', function(req, res){
	res.send("OPKS")
	
});



function inviteToResult(inv){
	return {
		id: inv._id,
		room: inv.room,
		user: {username: inv.user.username, avatar: inv.user.avatar},
		game: {route: inv.game.route, name: inv.game.name, logo: inv.game.logo}
	}
}

function userToResult(user){
	return {
		id: user._id,
		username: user.username, 
		email: user.email,
		avatar: user.avatar
	}
}