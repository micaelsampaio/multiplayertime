'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express = require('express')
var colors = require('colors/safe')
var app = express();
var express_session = require('express-session');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var User = require('./api/models/user');
var auth = require('./api/config/authentication');

var server = require('http').Server(app);
var io = require('socket.io')(server);

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/multiplayer_time_database', { useMongoClient: true })

var Category =  require('./api/models/category');
var Invite =  require('./api/models/invite');
var User =  require('./api/models/user');

module.exports = app;

Invite.remove({}, function(err){});

app.use(express_session({secret: "purple_hunicorn", resave: true, saveUninitialized:false, proxy: true,cookie: { maxAge: 60000000 }}));

var config = {
	appRoot: __dirname,
	swaggerSecurityHandlers: {
		jsonWebToken: function (req, authOrSecDef, scopesOrApiKey, cb) {
			var token = req.get("Authorization"); 
			jwt.verify(token,auth.secret, function(err, decoded) {
				if(err){
					return cb(new Error('access denied!'));
				}else{
					if (req.session.token == token && req.session.login) {
						req.session.decoded = decoded;
						return cb(null);
					}else{
						return cb(new Error('access denied!'));
					}
				}
			});
		},
		jsonAdminWebToken: function (req, authOrSecDef, scopesOrApiKey, cb) {
			var token = req.get("Authorization");
			jwt.verify(token,auth.secret, function(err, decoded) {
				if(err){
					return cb(new Error('access denied!'));
				}else{
					if (req.session.token == token && req.session.login && req.session.isAdmin) {
						return cb(null);
					}else{
						return cb(new Error('access denied!'));
					}
				}
			});
		}
	}
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
	if (err) { throw err; }

	app.use(express.static(__dirname + '/public'));
	app.set('uploadPath', __dirname + "/public/uploads/");

	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Credentials', true);
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header("Access-Control-Allow-Origin", "http://localhost");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	}); 

	app.get('/', function(req, res){
		res.sendFile(__dirname + '/views/index.html');
	});
	app.get('/u/:id', function(req, res){

		User.findOne({$or: [{username: req.params.id.toLowerCase()}, {email: req.params.id.toLowerCase()}] }, function(err, user) {
			if(!err && user){
				res.sendFile(__dirname + '/views/profile.html');
			}else{
				notfound(res);
			}
		});
		
	});
	app.get('/invites', function(req, res){
		res.sendFile(__dirname + '/views/invites.html');
	});
	app.get('/friends', function(req, res){
		if(req.session.login) {
			res.sendFile(__dirname + '/views/friend_requests.html');
		}else{
			notfound(res);
		}
	});

	app.get('/games', function(req, res){
		res.sendFile(__dirname + '/views/games.html');
	});
	
	app.get('/timeout', function(req, res){
		res.sendFile(__dirname + '/views/time.html');
	});

	app.get('/login', function(req, res){
		res.sendFile(__dirname + '/views/login.html');
	});
	app.get('/signup', function(req, res){
		res.sendFile(__dirname + '/views/register.html');
	});
	
	app.get('/origin', function(req, res){
		res.send(req.headers);
	});
	
	app.get('/404', function(req, res) {
		notfound(res);
	});

	app.get('/admin', function(req, res) {
		if(isAdmin(req)){
			res.sendFile(__dirname + '/views/admin/index.html');
		}else{
			notfound(res);
		}
	});
	app.get('/admin/:id', function(req, res) {
		if(isAdmin(req)){
			res.redirect('/admin/#!/'+req.params.id);
		}else{
			notfound(res);
		}
	});

	app.get('/game/:id', function(req, res) {
		res.sendFile(__dirname + '/games/'+req.params.id+'.html');
	});

	app.get('/game/:id/:room', function(req, res) {
		res.sendFile(__dirname + '/games/'+req.params.id+'.html');
	});

	app.get('/category/:id', function(req, res) {
		Category.findOne({_id: req.params.id}, function(err, category) {
			if (!err){
				if(category!= null){
					res.sendFile(__dirname + '/views/category.html');
				}else{
					notfound(res);
				}
			}else{
				notfound(res);
			}
		});
		
	});

	function isAdmin(req){
		return req.session.isAdmin;
	}

	function notfound(res){
		res.sendFile(__dirname + '/views/error404.html');
	}
	
	swaggerExpress.register(app);

	app.get('*', function(req, res) {
		notfound(res);
	});
	
	server.listen(2000);

	console.log("\n\n")
	console.log(colors.cyan(" __  __ _   _ _  _____ ___ ___ _      ___   _____ ___   ")+colors.magenta("_____ ___ __  __ ___ "));
	console.log(colors.cyan("|  \\/  | | | | ||_   _|_ _| _ \\ |    /_\\ \\ / / __| _ \\ ")+colors.magenta("|_   _|_ _|  \\/  | __|"));
	console.log(colors.cyan("| |\\/| | |_| | |__| |  | ||  _/ |__ / _ \\ V /| _||   / ")+colors.magenta("  | |  | || |\\/| | _| "));
	console.log(colors.cyan("|_|  |_|\\___/|____|_| |___|_| |____/_/ \\_\\_| |___|_|_\\ ")+colors.magenta("  |_| |___|_|  |_|___|"));

	console.log("")
	console.log(colors.cyan("\n\nWEBSITE Magic happens at --> ")+colors.magenta.underline("http://localhost:2000"));
	console.log("\n\n")
});

