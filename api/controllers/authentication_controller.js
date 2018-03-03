'use strict';

var app = require('../../app');
var User = require('../models/user');
var crypto = require('../helpers/crypto');
var auth = require('../config/authentication');
var jwt = require('jsonwebtoken'); 

module.exports.getLogin = function(req, res){
	var token = req.body.token;

	if(token != undefined && token != ""){

		jwt.verify(token, auth.secret, function(err, decoded) {      
			if (err) {
				return res.json({ success: false });
			} else {
				User.findOne({username: decoded.username}, function (err, user) {
					if(!err && user!=null){
						return res.json({ success: true, id: user.id, username: user.username, avatar: user.avatar, country: user.country });
					}else{
						return res.json({ success: false });
					}
				});
			}
		}
		);
	}
}
module.exports.login = function(req, res){
	var result = {
		success:false,
		messages: []
	};


	if(req.body.username!= null && req.body.username != ""){
		var p = crypto.encrypt(req.body.password);
		User.findOne({$or: [{username: req.body.username.toLowerCase()}, {email: req.body.username.toLowerCase()}] }, function (err, user) {
			if(!err && user && p == user.password){
				req.session.login = true;
				req.session.isAdmin = user.isAdmin;
				req.session.token = jwt.sign({userid : user._id, email: user.email, username : user.username}, auth.secret);
				req.session.decoded = {userid : user._id, email: user.email, username : user.username};
				result.token = req.session.token;
				result.id = user.id;
				result.username = user.username;
				result.avatar = user.avatar;
				result.country = user.country;
				result.success = true;
				result.messages.push({id:"Sucesso", message:"Login efetuado com sucesso."});
			}else{
				req.session.login = false;
				req.session.isAdmin = false;
				req.session.decoded = null;
				result.token = "";
				result.success = false;
				result.messages.push({id: "Erro", message:"Username ou Password Inválidos."});
			}
			
			req.session.decoded = null;

			res.json(result);
		});
	}else{
		req.session.login = false;
		req.session.isAdmin = false;
		req.session.decoded = null;
		result.token = null;

		result.success = false;
		if(req.body.username == null || req.body.username == "")
			result.messages.push({id: "ErroUsername", message: "O Username deve ser preenchido."});
		if(req.body.password == null || req.body.password == "")
			result.messages.push({id:"ErroPassword", message:"A password deve ser preenchida."});

		res.json(result);
	}
};

module.exports.logout = function(req, res){
	
	req.session.login = false;
	req.session.isAdmin = false;
	req.session.token = false;
	
	res.json({success: true, description:"Log out success!"});

};

module.exports.checklogin = function(req, res){
	if(req.session!= undefined && req.session.login){
		res.json({success: true, description:""});
	}else{
		res.json({success: false, description:""});
	}
};
