console.log(getServer("bulletWar"));

var client;
var mode = 0;
var LOAD = 0;
var GAME = 1;
var ENDGAME = 2;
var erroMsg;
//game 
var players;
var readyPlayers;
var player;

var explosions = [];
var dExplosion = [];
var dBullet = [];

var minY;
var maxY;

var ping = 0;
var pingTime;
var currentPingTime = 0;


function OnClick(mouse){
	if(mode == GAME){
		
		var x = mouse.x;
		var y = mouse.y ;
		if( y < maxY && y > minY){
			client.emit("move", {x: x  - player.obj.width/2, y: y - player.obj.height/2});
		}else{
			client.emit("shoot", {});
		}
	}
}

var game = new Engine("game", 900, 1200, {"resize": true, "click": OnClick});

game.start(loading);

game.loadImage("police","/games/stick-mountains/assets/police.png");
game.loadImage("explosion","/explosion-sprite.png");

game.load(onLoad);

var me = new game.Rect(0,0, 10, 10, "rgba(255,0,0,0.5)");
var server = new game.Rect(0,0, 10, 10, "rgba(0,0,255,0.5)")
var final = new game.Rect(0,0, 10, 10, "rgba(0,255,0,0.5)");

function onLoad(){
	client = new client(getServer("bulletWar"), "gamecontainer",
		{"exitRoom": exitRoom});

	client.on("startGame", onStartGame);
	client.on("move", onMove);
	client.on("hit", onHit);
	client.on("shoot", onShoot);
	client.login(onLogin);
}

function onLogin(success){
	if(success){
		game.update = menu;
	}else{
		game.update = erro;
	}
}



////SERVER RESPONSES
function getPlayer(id){
	for(var i = 0; i < players.length; i++){
		if(players[i].id == id){
			return players[i];
		}
	}
	return null;
}
function getPlayerId(id){
	for(var i = 0; i < players.length; i++){
		if(players[i].id == id){
			return i;
		}
	}
	return -1;
}

function loading(){

	game.drawGUILabel(0, game.height - 200, game.width, 200,  "Loading", "black", "60px Arial", "center", "middle"); 
	
}

function menu(){
	if(game.Button(200, 50, 200, 50, "CREATE GAME", "white", "blue")){
		client.createGame();
		game.update = lobby;
	}

	if(game.Button(200, 250, 200, 50, "QUICK FIND", "white", "blue")){
		client.findGame();
		game.update = lobby;
	}
	
}

function erro(){
	if(game.Button(200, 50, 200, 50, "Login", "white", "blue")){
		window.location="/login";
	}
	
}
function exitRoom(){
	game.update = menu; 
}
function lobby(){
	game.drawGUIText(10, 30, client.getRoom());

	var y = 70 + 50;
	var x = 10;
	for(var i = 0; i < client.getPlayers().length; i++){
		game.drawRect(x, y, 200, 300, "white");
		
		game.drawImage(client.getPlayers()[i].img, x +10, y + 10, 180, 180);
		game.drawImage(client.getPlayers()[i].flag, x+85, y + 190, 30, 30);

		//game.drawGUIText(x+10, y + 325, "WWWWWWWWWWWWWWW");
		game.drawGUILabel(x+200/2, y + 240, 300, 50, client.getPlayers()[i].username);
		

		x+= 360;
	}

	if(game.Button(10, 450, 200, 50, "Exit Room", "white", "blue")){
		client.exitRoom();
	}
	if(game.Button(220, 450, 200, 50, "START GAME", "white", "blue")){
		client.startGame();
	}
}
function onReady(data){
	if(mode == LOAD){
		mode = GAME;
		console.log("can play");
	}
	if(mode == ENDGAME){
		var index = getPlayerId(data.id);
		if(index!=-1){
			readyPlayers[index] = true;
		}

		console.log("READY " + readyPlayers);
	}
}
function onStartGame(data){
	console.log("START GAME");
	mode = GAME;

	players = [];
	dBullet = [];
	explosions = [];
	dExplosion = [];
	readyPlayers = [undefined, undefined];

	for(var i = 0; i< data.players.length; i++){
		var temp = data.players[i];

		players.push(new Player(temp.id, client.getPlayer(temp.id), temp.x, temp.y, temp.width, temp.height, game.getImage("police"), 100));

		if(temp.id == client.getID()){
			player = players[i];

			minY = temp.minY;
			maxY = temp.maxY;
		}
	}

	game.update = update; 

	client.emit("ready");
}
function onEndGame(data){
	mode = ENDGAME;
	game.offSetX = 0;
	game.offSetY = 0;
	for(var i = 0; i < data.points.length; i++){
		var p = getPlayer(data.points[i].id);
		if(p != null){
			p.points = data.points[i].points;
		}
	}

	game.update = endGame;
}
function update(){
	game.drawRect(0, 0, game.width, game.height, "#FFF");
	game.drawRect(0, minY, game.width, maxY, "#666");

	for(var i = 0; i < players.length; i++){
		players[i].update();
	}

	for(var i = 0; i < players.length; i++){
		players[i].draw();
	}
	
	for(var i =0; i< explosions.length; i++){
		explosions[i].obj.draw();
		explosions[i].update();
	}
	
	for(var i = 0; i < players.length; i++){
		for(var j = 0; j < players[i].bullets.length; j++){
			players[i].bullets[j].update();
			players[i].bullets[j].obj.draw();
			if(players[i].bullets[j].obj.y > game.canvas.height || players[i].bullets[j].obj.y <0){
				dBullet.push({player: players[i], bullet: players[i].bullets[j]});
			}
		}
	}
	//DESTROY
	if(dExplosion.length > 0){
		for(var i = 0; i < dExplosion.length; i++){
			var id = explosions.indexOf(dExplosion[i]);
			if(id>= 0){
				explosions.splice(id, 1);
			}
		}
		dExplosion = [];
	}
	if(dBullet.length > 0){
		for(var i = 0; i < dBullet.length; i++){
			var id = dBullet[i].player.bullets.indexOf(dBullet[i].bullet);
			if(id >= 0){
				dBullet[i].player.bullets.splice(id, 1);
			}
		}
		dBullet = [];
	}

	for(var i = 0; i < players.length; i++){
		players[i].drawHud();
	}

	game.drawGUIText(10, 30, game.getFPS());
}

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


function endGame(){
	/*if(game.Button(200, 50, 200, 50, "PLAY", "white", "blue")){
		console.log("CLICK END");
		client.emit("ready");
	}*/
}

function onPlay(data){
	var p = getPlayer(data.id);
	if(p != null){
		
	}
}


///game
function onShoot(data){
	var p = getPlayer(data.id);
	if(p != null){
		p.bullets.push(new Bullet(data.bullet, data.x, data.y, data.w, data.h, data.speed));
	}
}

function onMove(data){
	var p = getPlayer(data.id);
	if(p != null){
		if(p == player){
			me.x = p.obj.x;
			me.y = p.obj.y;
			me.width = p.obj.width;
			me.height = p.obj.height;

			server.x = data.x;
			server.y = data.y;
			server.width = p.obj.width;
			server.height = p.obj.height;

			final.x = data.goX;
			final.y = data.goY;
			final.width = p.obj.width;
			final.height = p.obj.height;
		}
		console.log(Math.distance(p.obj.x, p.obj.y, data.x, data.y));
		if(Math.distance(p.obj.x, p.obj.y, server.x, server.y)>10){
			p.obj.x = data.x;
			p.obj.y = data.y;
		}

		p.goX = data.goX;
		p.goY = data.goY;

		if(p.goX < p.obj.x + p.obj.width/2){
			p.obj.scale = -1;
		}else{
			p.obj.scale = 1;
		}
		p.action = data.action;
	}
}

function onHit(data){
	console.log(data);
	var p = getPlayer(data.id);
	var p2 = getPlayer(data.from);
	if(p!=null){
		p.hp = data.hp;
		if(p.hp<0){
			p.hp = 0;
		}
		dBullet.push({player: p2, bullet: p2.getBullet(data.bullet)});
		explosions.push(new Explosion(data.x, data.y));
	}
}

//CLASSES
function Player(id, info, x, y, width, height, sprite, hp){
	this.id = id;
	this.info = info;
	this.obj = new game.Sprite(x,y,width, height, sprite, 3, 4);
	
	this.obj.addAnimation("idle", [0,1], 0.5, true);
	this.obj.addAnimation("run", [3,4,5,6,7,8], 0.1, true);
	this.obj.addAnimation("die", [0,9,10,11], 0.1, false);
	this.anim = this.obj.animator;

	this.obj.scale = 1;
	this.sprite = sprite;
	//game
	this.maxHp = hp;
	this.hp = hp;
	this.goX = this.obj.x;
	this.goY = this.obj.y;
	this.bullets = [];
	var _self = this;

	this.draw = function(){
		this.obj.draw();
	}
	this.drawHud = function(){
		game.drawGUILabel(this.obj.x, this.obj.y - 40, this.obj.width, 10, this.info.username, "black", "20px Arial", "center", "middle");
		game.drawRect(this.obj.x, this.obj.y - 20, this.obj.width, 10, "#500");
		game.drawRect(this.obj.x, this.obj.y - 20, this.hp * this.obj.width / this.maxHp, 10, "#F00");
	}
	this.update = function(){
		if(this.action == "idle"){
			this.anim.play("idle");
		}

		if(this.action == "run"){
			

			var data = distanceAndAngleBetweenTwoPoints(this.obj.x, this.obj.y, this.goX, this.goY);
			if(data.distance > 5){
				this.anim.play("run");

				var velocity = 350;
				var toMouseVector = new Vector(velocity, data.angle);

				this.obj.x += (toMouseVector.magnitudeX * game.deltaTime);
				this.obj.y += (toMouseVector.magnitudeY * game.deltaTime);
			}else{
				this.obj.x = this.goX;
				this.obj.y = this.goY;
				this.action = "idle";
				console.log("STOP " + this.obj.x + " " +this.obj.y);
			}
			//console.log(this.obj.y);
		}
	}
	this.getBullet = function(id){
		for(var i = 0; i < this.bullets.length; i++){
			if(id == this.bullets[i].id){
				console.log("Bullet send " + this.bullets[i].id);
				return this.bullets[i];
			}
		}
		return -1;
	}
}
function Bullet(id, x,y, w, h, speed){
	this.id = id;
	this.obj = new game.Rect(x,y,w,h, "black");
	this.speed = speed;
	this.update = function(){
		this.obj.y += this.speed * game.deltaTime;
	}
}

function Explosion(x, y){
	this.obj = new game.Sprite(x,y,30,30,game.getImage("explosion"), 5, 3);
	this.obj.addAnimation("boom", [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 0.05, false);

	this.update = function(){
		if(!this.obj.animator.isPlaying){
			DestroyExplosion(this);
		}
	}
}
function DestroyExplosion(exp){
	dExplosion.push(exp);
}

function distanceAndAngleBetweenTwoPoints(x1, y1, x2, y2) {
	var x = x2 - (x1),
	y = y2 - (y1);

	return {
		distance: Math.sqrt(x * x + y * y),
		angle: Math.atan2(y, x) * 180 / Math.PI
	}
}

function Vector(magnitude, angle) {
	var angleRadians = (angle * Math.PI) / 180;

	this.magnitudeX = magnitude * Math.cos(angleRadians);
	this.magnitudeY = magnitude * Math.sin(angleRadians);
}

