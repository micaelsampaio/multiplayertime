'use strict';
//var Category = require('../models/category'); 
var Invite = require('../models/invite');
var User = require('../models/user');
var notifications = require("../controllers/notifications_controller");

module.exports.addInvite = function(req, res) {
	var room = req.swagger.params.id.value.toLowerCase();
	if(req.session != null && room != undefined && req.body.game != undefined && req.body.id.length>0){
		var userid = req.session.decoded.userid.toLowerCase();
		var result = {size: 0, length: req.body.id.length};	
		for(var i = 0; i < req.body.id.length; i++){
			var u = req.body.id[i];
			addInvite(userid, room, req.body.game, u.toLowerCase(), req.session.token, result);
		}
		return res.json({success : true, description:""});
	}else{
		return res.json({success : false, description:"Need more Data."});
	}
}

function addInvite(userid, room,game, u, token){
	User.findOne({username: u}, function(err, user){
		if(!err && user){
			Invite.findOne({you : user.id, user: userid, room: room}, function (err, inv) {
				if(!err && inv!=null){
					inv.accepted = undefined;
					inv.save();
				}else if(!err && inv == null){
					var ninv = Invite({
						room: room,
						user: userid,
						you: user.id,
						game: game,
						accepted : undefined
					});
					ninv.save();
				}
				notifications.sendNotification(token, user.id);
			});
		}
	});
}
module.exports.acceptInvite = function(req, res) {
	var id = req.swagger.params.id.value.toLowerCase();

	if(id != undefined){
		for(var i = 0; i < req.body.id.length; i++){
			var u = req.body.id[i];
			Invite.findOne({_id : id}, function (err, inv) {
				if(!err && invite!=null){
					inv.accepted = true;
					inv.save();
					return res.json({success : true, description:"Success."});
				}else{
					return res.json({success : false, description:"This game don't exist anymore."});
				}
			});
		}
		
	}else{
		return res.json({success : false, description:"Need more Data."});
	}
}
module.exports.denyInvite = function(req, res) {
	var id = req.swagger.params.id.value.toLowerCase();

	if(id != undefined){
		for(var i = 0; i < req.body.id.length; i++){
			var u = req.body.id[i];
			Invite.findOne({_id : id}, function (err, inv) {
				if(!err && invite!=null){
					inv.accepted = false;
					inv.save();
					return res.json({success : true, description:"Success."});
				}else{
					return res.json({success : false, description:"This game don't exist anymore."});
				}
			});
		}
		
	}else{
		return res.json({success : false, description:"Need more Data."});
	}
}

module.exports.getInvites = function(req, res) {
	
	var userid = req.session.decoded.userid.toLowerCase();

	var result = [];

	Invite.find({you: userid}).populate('game').populate("user").exec( function(err, invites) {
		if(!err && invites != null){
			for(var i = 0; i < invites.length; i++){
				result.push(inviteToResult(invites[i])); 
			}
			res.json(result);
		}else{
			res.json(result);
		}
	});
}

module.exports.getInvitesByGame = function(req, res) {
	var id = req.swagger.params.id.value.toLowerCase();
	var userid = req.session.decoded.userid.toLowerCase();
	console.log("INVITES "+ userid);
	var result = [];

	Invite.find({you: userid, game: id}).populate('game').populate("user").exec( function(err, invites) {
		console.log(invites);
		if(!err && invites != null){
			for(var i = 0; i < invites.length; i++){
				result.push(inviteToResult(invites[i])); 
			}
			res.json(result);
		}else{
			res.json(result);
		}
	});
}

module.exports.removeInvite = function(req, res) {
	var id = req.swagger.params.id.value.toLowerCase();
	var userid = req.session.decoded.userid.toLowerCase(); 
	
	console.log("REMOVE ONE " + id);

	Invite.remove({ _id: id }, function(err) {
		if (!err) {
			return res.json({success : true, description:"Invite Removed!"});
		}
		else {
			return res.json({success : false, description:"You have no invite"});
		}
	});
}

module.exports.removeAllInvites = function(req, res) {
	var id = req.swagger.params.id.value.toLowerCase();
	
	console.log("REMOVE ALL " + id);

	Invite.remove({ room : id}, function(err) {
		if (!err) {
			res.json({success : true, description:"Invites Removed!"});
		}
		else {
			res.json({success : false, description:"You have no invite"});
		}
	});
}

function inviteToResult(inv){
	return {
		id: inv._id,
		room: inv.room,
		user: {username: inv.user.username, avatar: inv.user.avatar},
		game: {route: inv.game.route, name: inv.game.name, logo: inv.game.logo}
	}
}