'use strict';

var User = require('../models/user');
var Friend = require('../models/friend');
var fs = require('fs');
var uniqid = require('uniqid');
var crypto = require('../helpers/crypto');

module.exports.addUser = function(req, res) {
	console.log("POST NEW USER ");
	console.log(req.body);

	var user = User({
		username: req.body.username.toLowerCase(),
		email: req.body.email.toLowerCase(),
		password: crypto.encrypt(req.body.password),
		isAdmin: false,
		country: req.body.country,
		avatar: "noavatar.png",
		token: ""
	});

	user.save(function(err) {
		if (!err){;
			res.json({success: true, description: "Sucess!"});
		}else{
			res.json({success: false, description: "Error"});
		}
	});
};
module.exports.updateUser = function(req, res) {
	console.log("PUT EDIT USER ");
	console.log(req.body);
	User.findOne({_id : req.swagger.params.id.value}, function (err, user) {

		if(!err && user){
			user.password = req.body.password;
			res.json({success : true, description:"Dados editados com sucesso."});
		}else{
			res.json({success : false, description:"Erro ao editar Dados."});
		}
	});
};

module.exports.updatePassword = function(req, res) {
	if(req.session!= null && req.session.decoded && req.session.decoded.userid){
		var userid = req.session.decoded.userid.toLowerCase();
		User.findOne({_id : userid, password : req.body.password}, function (err, user) {

			if(!err && user){
				user.password = req.body.newpassword;
				user.save();
				res.json({success : true, description:"UPDATED"});
			}else if(user){
				res.json({success : false, description:"ERROR"});
			}
		});
	}else{
		res.json({success : false, description:"ERROR LOGIN"});
	}
};
module.exports.updateAvatar = function(req, res) {
	if(req.session!= null && req.session.decoded && req.session.decoded.userid){
		var userid = req.session.decoded.userid.toLowerCase();

		var avatar = req.swagger.params.avatar.value;

		if(avatar == undefined){
			res.json({success: false, description: "No avatar"});
			return;
		}

		var types = avatar.originalname.toLowerCase().split(".");
		var type = types[types.length -1];

		console.log(type);
		if(type != 'jpg' && type != 'jpeg' && type!='png'){
			console.log("ERRO ~2");
			res.json({success: false, description: "wrong type"});
			return;
		}

		User.findOne({_id : userid}, function (err, user) {
			if(!err && user){
				console.log("USER ");
				if(user.avatar == 'noavatar.png'){
					user.avatar = "USER_" + uniqid() + "." + type;
					user.save();
				}else{
					var newA = user.avatar.split(".");
					console.log(newA);
					newA.splice(newA.length-1, 1);
					console.log(newA);
					console.log(newA.join());
					user.avatar = newA.join() + "." + type;
					user.save();
				}
				var file = user.avatar;
				fs.writeFile(req.app.get('uploadPath') + user.avatar, avatar.buffer,  "binary", function(err){
					console.log("upload " + file);
					if(err){
						res.json({success : false, description:"ERROR UPLOAD"});
					}else{
						res.json({success : true, description: file});
					}
				});
			}else{
				console.log("ERRO USER ");
				res.json({success : false, description:"ERROR"});
			}
		});
	}else{
		console.log("ERRO LOGIN ");
		res.json({success : false, description:"ERROR LOGIN"});
	}
};
module.exports.getAllUsers = function(req, res) {
	console.log("USERS");
	var result = [];

	User.find({}, function(err, users) {
		if (err) throw err;

		for(var i = 0; i < users.length; i++){
			result.push(userToResult(users[i]));
		}
		res.json(result);
	});
	
};
module.exports.findUsers = function(req, res) {
	console.log("USERS");
	var result = [];
	var id = req.swagger.params.id.value;
	User.find({username: new RegExp(id, 'i')}).limit(5).sort( { username: 1 }).exec(function(err, users) {
		if (err) throw err;

		for(var i = 0; i < users.length; i++){
			result.push(userToResult(users[i]));
		}
		res.json(result);
	});
	
};
module.exports.checkEmail = function(req, res) {
	if(req.swagger.params.id == null){
		res.json({success : false, description:"NULL"});
		return;
	}
	console.log(req.swagger.params.id); 
	User.findOne({email : req.swagger.params.id.value.toLowerCase()}, function (err, user) {
		if(!err && !user){
			res.json({success : true, description:"Valid Email!"});
		}else{
			res.json({success : false, description:"Email already Exists"});
		}
	});
}
module.exports.checkUsername = function(req, res) {
	if(req.swagger.params.id == null){
		res.json({success : false, description:"NULL"});
		return;
	}
	console.log(req.swagger.params.id.value); 
	User.findOne({username : req.swagger.params.id.value.toLowerCase()}, function (err, user) {
		if(!err && !user){
			res.json({success : true, description:"Valid Username!"});
		}else{
			res.json({success : false, description:"Username already Exists"});
		}
	});
}
module.exports.getProfile = function(req, res) {
	console.log("Profile");
	User.findOne({$or: [{username: req.swagger.params.id.value.toLowerCase()}, {email: req.swagger.params.id.value.toLowerCase()}] }, function(err, user) {
		if (!err && user != null){
			var result = userToResult(user);
			result.isFriend = "you";
			if(req.session != null && req.session.decoded!= null && req.session.decoded.userid !=null && req.session.decoded.userid != result.id){
				result.isFriend = "nofriend";
				//{user: req.session.decoded.userid, accepted: true, friend: result.id}
				Friend.findOne({$or: [{user: req.session.decoded.userid, friend: result.id}, {friend: req.session.decoded.userid, user: result.id}]}, function(err, friend) {
					if(!err && friend!=null){
						if(friend.accepted){
							result.isFriend = "friend";
						}else if(friend.user == req.session.decoded.userid){
							result.isFriend = "friendrequestsent";
						}else{
							result.isFriend = "friendrequest";
						}
					}
					res.json(result);
				});
			}else{
				res.json(result);
			}
			
		}else{
			res.json({});
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