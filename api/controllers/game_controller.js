'use strict';
//var Category = require('../models/category'); 
var Game = require('../models/game');
var fs = require('fs');
var uniqid = require('uniqid');
var path = "/uploads/";

module.exports.upload = function(req, res) {
	
	var file = req.swagger.params.avatar.value;
	

	var data = {
		'id': file.name,
		'extension': file.extension,
		'size': file.size,
		'type': file.mimetype
	};

	console.log(data);

	
	/*fs.writeFile( req.app.get('uploadPath') + 'teste', "Hey there!", function(err) { 
		if(err) {
			return console.log(err);
		}else{
			console.log("The file was saved!");
		}
	}); */

	//console.log(req.swagger.params);
	console.log(req.body);

	/*var fileupload = true;
	fs.writeFile(req.app.get('uploadPath') + file.originalname, file.buffer,  "binary", function(err){

		if(err){
			console.log("ERRO " + err);
		}else{
			console.log("SUCESSO!");
			fileupload = true;
		}
	});*/

  // repetitive but...
  // upload_file({ dest: './uploads/images/'});

  //res.json(data);
	/*uploadImg(req, res, function (err) {
		if (err) {
			throw err
		}
		console.log("FILE")
		console.log(req.file);
		console.log(req.files);
		var oldpath = req.file.path;
		var newpath = __dirname + '/public/uploads/' + req.file.originalname;
		fs.rename(oldpath, newpath, function (err){
			if (err) throw err;
			res.write('File uploaded and moved!');
			res.end();
		});
	})*/
	console.log("FIM!");
	res.json({success: true, description: ""+data});
}
module.exports.addGame = function(req, res) {
	console.log("ADD GAME");
	console.log(req.body);

	var card_image = req.swagger.params.card_image.value;
	var logo = req.swagger.params.logo.value;

	if(card_image == undefined){
		res.json({success: false, description: "Game needs card image."});
		return;
	}
	if(logo == undefined){
		res.json({success: false, description: "Game needs a logo."});
		return;
	}

	var type_card_image = card_image.originalname.split(".");
	var type_logo = logo.originalname.split(".");
	var validImage = false;

	if(type_card_image != undefined && (type_card_image[type_card_image.length-1]=="png" || type_card_image[type_card_image.length-1]=="jpg")){
		validImage = true;
	}
	if(type_logo != undefined && (type_card_image[type_logo.length-1]=="png" || type_card_image[type_logo.length-1]=="jpg")){
		validImage = true;
	}

	if(!validImage){
		res.json({success: false, description: "Invalid Images"});
		return;
	}

	var game = Game({
		route: req.body.route,
		name: req.body.name,
		description: req.body.description,
		min_players: req.body.min_players,
		max_players: req.body.max_players,
		category : req.body.category_id,
		color: req.body.color,
		card_image: "GAME_BG_"+uniqid()+"."+type_card_image[type_card_image.length-1],
		logo: "GAME_LOGO_"+uniqid()+"."+type_logo[type_logo.length-1]
	});
	console.log("GAME");
	console.log(game);

	fs.writeFile(req.app.get('uploadPath') + game.card_image, card_image.buffer,  "binary", function(err){

		if(err){
			console.log("ERRO " + err);
		}else{
			console.log("SUCESSO!");
		}
	});

	fs.writeFile(req.app.get('uploadPath') + game.logo, logo.buffer,  "binary", function(err){

		if(err){
			console.log("ERRO " + err);
		}else{
			console.log("SUCESSO!");
		}
	});

	game.save(function(err) {
		if (err){
			res.json({success: false, description: "Error at add game."});
		} else{
			res.json({success: true, description: "Game created with success!"});
		}
	});
};
module.exports.updateGame = function(req, res) {
	Game.findOne({_id : req.swagger.params.id.value}, function (err, game) {
		if(!err && game!= null){

			var card_image = req.swagger.params.card_image.value;
			var logo = req.swagger.params.logo.value;

			var upload1 = false;
			var upload2 = false;

			if(card_image != undefined){
				var type_card_image = card_image.originalname.split(".");
				if(type_card_image != undefined && (type_card_image[type_card_image.length-1]=="png" || type_card_image[type_card_image.length-1]=="jpg")){
					upload1 = true;
					if(game.card_image == undefined){
						game.card_image = "GAME_BG_"+uniqid()+"."+type_card_image[type_card_image.length-1];
					}
				}
			}
			if(logo != undefined){
				var type_logo = logo.originalname.split(".");
				if(type_logo != undefined && (type_card_image[type_logo.length-1]=="png" || type_card_image[type_logo.length-1]=="jpg")){
					upload2 = true;
					if(game.logo == undefined){
						game.logo = "GAME_LOGO_"+uniqid()+"."+type_logo[type_logo.length-1]
					}
				}
			}
			
			
			if(upload1){
				fs.writeFile(req.app.get('uploadPath') + game.card_image, card_image.buffer,  "binary", function(err){

					if(err){
						console.log("ERRO " + err);
					}else{
						console.log("SUCESSO!");
					}
				});
			}

			if(upload2){
				fs.writeFile(req.app.get('uploadPath') + game.logo, logo.buffer,  "binary", function(err){

					if(err){
						console.log("ERRO " + err);
					}else{
						console.log("SUCESSO!");
					}
				});
			}

			game.route= req.body.route;
			game.name= req.body.name;
			game.description= req.body.description;
			game.min_players= req.body.min_players;
			game.max_players= req.body.max_players;
			game.color= req.body.color;
			game.category = req.body.category_id;
			
			game.save();

			res.json({success : true, description:"Dados editados com sucesso."});
		}else{
			res.json({success : false, description:"Erro ao editar Dados."});
		}
	});
};
module.exports.deleteGame = function(req, res) {
	Game.remove({ _id: req.swagger.params.id.value }, function(err) {
		if (!err) {
			res.json({success : true, description:"Jogo eliminado com sucesso."});
		}
		else {
			res.json({success : false, description:"Essa categoria não existe."});
		}
	});
};
module.exports.deleteManyGames = function(req, res) {
	console.log("ELIMINAR");
	console.log(req.body);
	Game.remove({ _id: {$in: req.body.id} }, function(err) {
		if (!err) {
			res.json({success : true, description:"Jogos eliminados com sucesso."});
		}
		else {
			res.json({success : false, description:"Ocorreu um erro"});
		}
	});
};
module.exports.getGames = function(req, res) {
	var result = [];

	Game.find({}).populate('category').exec( function(err, games) {
		if(!err && games != null){
			for(var i = 0; i < games.length; i++){
				result.push(gameToResult(games[i]));
			}
			res.json(result);
			
		}else{
			res.json([]);
		}
	});
	
};
module.exports.getGamesByCategory = function(req, res) {
	var result = [];

	Game.find({category: req.swagger.params.id.value}).populate('category').exec(function(err, games) {
		if(!err && games != null){
			for(var i = 0; i < games.length; i++){
				result.push(gameToResult(games[i]));
			}
			res.json(result);
			
		}else{
			res.json([]);
		}
	});
	
};
module.exports.getRecentGames = function(req, res) {
	var result = [];

	Game.find({},{}, {sort:{created_at: -1}, limit: 3}).populate('category').exec(function(err, games) {
		if(!err && games != null){
			for(var i = 0; i < games.length; i++){
				result.push(gameToResult(games[i]));
			}
			res.json(result);
			
		}else{
			res.json([]);
		}
	});
	
};

module.exports.getGame = function(req, res) {
	
	Game.findOne({_id: req.swagger.params.id.value}).populate('category').exec(function(err, game) {
		if(!err && game!=null){
			res.json(gameToResult(game));	
		}else{
			res.status(400);
			res.json({message: "Esse Jogo não existe"});
		}
	});
	
};

module.exports.getGameByRoute = function(req, res) {
	
	Game.findOne({route: req.swagger.params.id.value}).populate('category').exec(function(err, game) {
		if(!err && game!=null){
			res.json(gameToResult(game));	
		}else{
			res.status(400);
			res.json({message: "Esse Jogo não existe"});
		}
	});
	
};

function gameToResult(game){
	var result = {
		id: game._id,
		route: game.route,
		name: game.name,
		description: game.description,
		min_players: game.min_players,
		max_players: game.max_players,
		players: game.players,
		color: game.color,
		card_image: path + game.card_image,
		logo : path +game.logo,
		category: game.category == null ? {id: -1, name: ""} : {id: game.category._id, name: game.category.name},
	}
	return result;
}
