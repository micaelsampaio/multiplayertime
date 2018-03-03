'use strict';
//var Category = require('../models/category'); 
var Friend = require('../models/friend');
var notifications = require("../controllers/notifications_controller");

module.exports.addFriend = function(req, res) {
	var userid = req.session.decoded.userid.toLowerCase();
	var friend = req.swagger.params.id.value.toLowerCase();

	if(userid != friend){
		//check if already friend
		Friend.findOne({user : userid, friend: friend}, function (err, user) {
			if(!err && !user){
				//check if has a request of that friend
				Friend.findOne({friend : userid, user: friend}, function (err, user) {
					//accept the request
					if(!err && user != null){
						user.accepted = true;
						var f = Friend({
							user: user.friend,
							friend: user.user,
							accepted : true
						});
						user.save();
						f.save();
						res.json({success : false, description:"sucess!"});
					}
					//no request so send one
					else if(!err && user == null){
						var f = Friend({
							user: userid,
							friend: friend,
							accepted : false
						});

						f.save(function(err) {
							if (!err){
								notifications.sendNotification(req.session.token, friend);
								res.json({success: true, description: "Sucess!"});
							}else{
								res.json({success: false, description: "Error"});
							}
						});
					}
				});
				

			}else{
				res.json({success : false, description:"You are already friends!"}); 
			}
		});
	}else{
		res.json({success : false, description:"You can't add yourself as friend"});
	}

	///acept 
};
module.exports.acceptFriend = function(req, res) {
	var userid = req.session.decoded.userid.toLowerCase();
	var friend = req.swagger.params.id.value.toLowerCase();

	Friend.findOne({user : friend, friend: userid}, function (err, user) {
		
		if(!err && user){

			user.accepted = true;
			var f = Friend({
				user: user.friend,
				friend: user.user,
				accepted : true
			});
			user.save();
			f.save();

			res.json({success : false, description:"sucess!"});

		}else{
			res.json({success : false, description:"You have no request"}); 
		}
	});
	
};

module.exports.removeFriend = function(req, res) {
	var userid = req.session.decoded.userid.toLowerCase();
	var friend = req.swagger.params.id.value.toLowerCase();

	Friend.remove({ user : friend, friend: userid }, function(err) {
		if (!err) {
			Friend.remove({ user : userid, friend: friend }, function(err) {
				if (!err) {
					res.json({success : true, description:"Removed"});
				}
				else {
					res.json({success : true, description:"Removed"});
				}
			});
		}
		else {
			res.json({success : false, description:"Not found"});
		}
	});

};

module.exports.getFriends = function(req, res) {
	var userid = req.swagger.params.id.value.toLowerCase();

	var result = [];

	Friend.find({user: userid, accepted: true}).populate('friend').exec( function(err, users) {
		if(!err && users != null){
			for(var i = 0; i < users.length; i++){
				result.push(userToResult(users[i].friend));
			}
			res.json(result);
			
		}else{
			res.json([]);
		}
	});
};

module.exports.getFriendRequests = function(req, res) {
	var userid = req.session.decoded.userid.toLowerCase();

	var result = [];

	Friend.find({friend: userid, accepted: false}).populate('user').exec( function(err, users) {
		if(!err && users != null){
			for(var i = 0; i < users.length; i++){
				result.push(userToResult(users[i].user));
			}
			res.json(result);
			
		}else{
			res.json([]);
		}
	});
};

module.exports.getFriendRequestsSent = function(req, res) {
	var userid = req.session.decoded.userid.toLowerCase();

	var result = [];

	Friend.find({user: userid, accepted: false}).populate('friend').exec( function(err, users) {
		if(!err && users != null){
			for(var i = 0; i < users.length; i++){
				result.push(userToResult(users[i].friend));
			}
			res.json(result);
			
		}else{
			res.json([]);
		}
	});
};

function userToResult(user){
	return {
		id: user._id,
		username: user.username, 
		email: user.email,
		avatar: user.avatar
	}
}