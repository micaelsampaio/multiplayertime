console.log(getServer("stickMontainsServer"));

var client;
var mode = 0;
var LOAD = 0;
var GAME = 1;
var ENDGAME = 2;
var erroMsg;
var theme = {backgroundColor: "#74c7d9", loading: "#fff", nonLoading: "#444", font:"gamefont"
};
//game 
var game = new Engine("game", 1080, 600, {resize: true});

game.start(loading);

game.loadImage("police","/games/stick-mountains/assets/police.png");
game.loadImage("unicorn","/games/stick-mountains/assets/unicorn.png");
game.loadImage("bg","/games/stick-mountains/assets/bg.png");
game.loadImage("cloud","/games/stick-mountains/assets/cloud.png");
game.loadImage("block1","/games/stick-mountains/assets/block1.png");
game.loadImage("block2","/games/stick-mountains/assets/block2.png");
game.loadImage("block3","/games/stick-mountains/assets/block3.png");
game.loadImage("hud_police","/games/stick-mountains/assets/hud_police.png");
game.loadImage("hud_unicorn","/games/stick-mountains/assets/hud_unicorn.png");
game.loadImage("hp","/games/stick-mountains/assets/hp2.png");
game.loadImage("logo","/games/stick-mountains/assets/logo.png");
game.loadImage("btPlay","/games/stick-mountains/assets/button_play.png");
game.loadImage("btBack","/games/stick-mountains/assets/button_back.png");
game.loadImage("btFind","/games/stick-mountains/assets/button_find.png");
game.loadImage("btAdd","/games/stick-mountains/assets/button_add.png");
game.loadImage("btInvites","/games/stick-mountains/assets/button_invite.png");
game.loadImage("btLogin","/games/stick-mountains/assets/button_login.png");

game.loadSound("bgMusic", "/games/stick-mountains/assets/bgMusic.mp3");
game.loadSound("beep", "/games/stick-mountains/assets/beep.wav");
game.loadSound("fall", "/games/stick-mountains/assets/fall.wav");
game.loadSound("hit", "/games/stick-mountains/assets/hit.wav");
game.loadSound("grow", "/games/stick-mountains/assets/grow.wav");
game.loadSound("wrong", "/games/stick-mountains/assets/wrong.wav");
game.loadSound("success", "/games/stick-mountains/assets/success.wav");

game.load(onLoad);

function onLoad(){
	client = new client(getServer("stickMontainsServer"), "gamecontainer",
		{"exitRoom": exitRoom, "createGame": onCreateGame, "findGame": onFindGame});

	client.on("startGame", onStartGame);
	client.on("endGame", onEndGame);
	client.on("ready", onReady);
	client.on("onPlay", onPlay);
	client.on("newBlocks", onNewBlocks);
	client.on("userDisconnect", onDisconnect);
	//game.update = menu;
	client.login(onLogin);
}

function onLogin(success, error){
	if(success){
		game.update = menu;
	}else if(error == 0){
		game.update = loginError;
	}
	else if(error == 1){
		game.update = doubleLoginError;
	}
}

var players;
var readyPlayers;
var player;
var mPlayer;

var gameY;
var maxBarSize;
var fps = 0;

var blocks = [];
var effects =[];
var target;
var effectsDestroy =[];
var canClick = true;
var isClick = false;
var isClickEnded = false;
var startTime = 0;
var endTime = 0;

var background = new Background();
var bgMusic = null;
var growSound = null;
var notification = null;

game.canvas.addEventListener(game.isMobile() ? 'touchstart' : 'mousedown', function(event) {
	mouseDown();
}, false);
game.canvas.addEventListener(game.isMobile() ?'touchend' : 'mouseup', function(event) {
	mouseUp();
}, false);

//GAME FUNCTIONS
function mouseDown() {
	if(mode == GAME && canClick && !isClick && player.hp>0){
		player.bar.visible = true;
		isClick = true;
		startTime = getTime();
		if(growSound == null){
			growSound = game.playSound("grow", 0.5, true);
		}else{
			growSound.play();
		}
	}
}

function mouseUp() {
	if(mode == GAME && canClick &&isClick){
		isClick = false;
		growSound.stop();
		growSound = null;
		play();
	}
}

function play(){
	//server stuff
	//TO DO REMOVE ID
	client.emit("play", {"id" : player.id, "power": player.bar.barHeight});
	
	canClick = false;
}

function playSuccess(p){
	p.bar.reset();
	p.currentBlock++;
	if(p == player){
		isClick = false;
		canClick = true;
	}
}
function playFail(p){
	p.bar.reset();
	if(p == player){
		isClick = false;
		canClick = true;
	}
}
function playDead(p){
	p.bar.reset();
	p.reset();
	if(p == player){
		isClick = false;
		canClick = true;
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
	game.drawRect(0, 0, game.width, game.height, theme.backgroundColor);
	
	game.drawGUILabel(0, game.height - 200, game.width, 50, "Loading...","white", "30px " + theme.font,"center", "middle");
	game.drawRect(game.width/2 / 2, game.height - 150, game.width/2, 20, theme.nonLoading);
	game.drawRect(game.width/2 / 2, game.height - 150, game.getLoading() * (game.width/2) / 100, 20, theme.loading);
}
function loginError(){
	background.draw();
	
	game.drawImage(game.getImage("logo"),340, -50, 400, 400);

	game.drawGUILabel(0,game.height - 300, game.width, 100, "You are not logged in!", theme.textColor, theme.font, "center", "middle");
	
	if(game.ImageButton(game.width/2 - 75, game.height - 200, 150, 150, "", "", game.getImage("btLogin"))){
		game.playSound("beep");
		window.location="/login";
	}
}
function doubleLoginError(){
	background.draw();
	
	game.drawImage(game.getImage("logo"),340, -50, 400, 400);

	game.drawRect(10, game.height - 150, game.width - 20, 100, "rgba(0,0,0,0.5)");
	game.drawGUILabel(0,game.height - 150, game.width, 100, "You are already playing this game!", "#FFF", "Arial 20px", "center", "middle");
}

function onCreateGame(){
	game.update = lobby;
}

function onFindGame(room){
	console.log("ROOM " + room);
	if(room != null){
		game.update = lobby;
	}else{
		game.update = erro;
	}
}

function menu(){
	game.offSetX = 0;
	game.offSetY = 0;
	
	if(bgMusic != null){
		bgMusic.stop();
		bgMusic = null;
	}
	background.draw();
	
	game.drawImage(game.getImage("logo"),340, -50, 400, 400);


	if(game.ImageButton(435, 375, 200, 200, "", "", game.getImage("btPlay"))){
		game.playSound("beep");
		client.createGame();
	}
	
	if(game.ImageButton(155, 400, 150, 150, "", "", game.getImage("btInvites"))){
		game.playSound("beep");
		client.invites();
	}
	if(game.ImageButton(770, 400, 150, 150, "", "", game.getImage("btFind"))){
		game.playSound("beep");
		client.findGame();
	}

	if(notification!=null)
		notification.draw();
	
}

function erro(){
	if(game.Button(200, 50, 200, 50, "Login", "white", "blue")){
		game.playSound("beep");
		window.location="/login";
	}
	
}
function exitRoom(){
	game.update = menu; 
}
function lobby(){
	background.draw();

	var y = 70 + 50;
	var x = 10;
	var w = 200;

	var x = (game.width - w * client.getPlayers().length) / (client.getPlayers().length+1); 
	var off = x;
	for(var i = 0; i < client.getPlayers().length; i++){

		game.drawCircle(x +15, y, 170, "white");
		game.drawGUICircleImage(client.getPlayers()[i].img, x +25, y + 10, 150, 150);
		game.drawGUICircleImage(game.getImage(i == 0 ? "hud_police" : "hud_unicorn"), x-10, y - 10, 50, 50);
		game.drawImage(client.getPlayers()[i].flag, x+85, y + 180, 30, 30);

		game.drawGUILabel(x, y + 200, w, 50, client.getPlayers()[i].username, "white", "30px " + theme.font, "center", "middle");
		

		x += w + off; 
	}

	if(game.ImageButton(110, 400, 150, 150, "", "", game.getImage("btBack"))){
		game.playSound("beep");
		client.exitRoom();
	}
	if(game.ImageButton(470, 400, 150, 150, "", "", game.getImage("btAdd"))){
		game.playSound("beep");
		client.invite();
	}
	if(game.ImageButton(830, 400, 150, 150, "", "", game.getImage("btPlay"))){
		game.playSound("beep");
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
	if(bgMusic == null)
		bgMusic = game.playSound("bgMusic", 0.5, true);

	console.log("START GAME");

	mode = LOAD;
	document.getElementById("game").style.display="block";
	
	blocks = [];
	effects = [];
	effectsDestroy = [];
	players = [];
	readyPlayers = [undefined, undefined, undefined, undefined];

	gameY = data.gameY;
	maxBarSize = data.maxPower;

	var w = data.playerWidth;
	var h = data.playerHeight;
	var hp = data.hp;

	for(var i = 0; i< data.players.length; i++){
		var temp = data.players[i];
		//temp.sprite
		players.push(new Player(temp.id, client.getPlayer(temp.id), temp.x, gameY-h, w, h, characters[temp.sprite], hp, {x:30 + (250*i), y:20}));

		if(temp.id == client.getID()){
			player = players[i];
			game.offSetX = -(player.obj.x - 100);
		}
	}
	onNewBlocks(data);
	
	canClick = true;
	isClick = false;

	target = player;

	game.update = update; 
	console.log("READY");
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
	
	if(isClick){
		player.bar.setHeight((getTime() - startTime) / 1000);
	}

	
	for(var i = 0; i < players.length; i++){
		players[i].update();
	}

	background.draw();

	if(player.dead == true){
		target = getFirstPlayer();
	}
	
	if(target != null)
		game.offSetX = Math.lerp(game.offSetX, -(target.obj.x - 100), game.deltaTime * 5);
	
	for(var i = 0; i < blocks.length; i++){
		blocks[i].draw();
	}
	for(var i = 0; i < players.length; i++){
		game.drawText(players[i].x, players[i].y - 80, players[i].info.username);
		players[i].draw();
	}

	for(var i = 0; i < players.length; i++){
		players[i].drawGUI();
		//game.drawGUIText(players[i].x, players[i].y -10, players[i].id);
	}
	for(var i = 0; i < effects.length; i++){
		effects[i].draw();
	}
	if(effectsDestroy.length > 0){
		for(var i = 0; i < effectsDestroy.length; i++){
			var index = effects.indexOf(effectsDestroy[i]);
			if(index != -1){
				effects.splice(index, 1);
			}
		}
	}
}
function endGame(){

	background.draw();

	if(game.ImageButton(260, 450, 150, 150, "", "", game.getImage("btBack"))){
		game.playSound("beep");
		client.exitRoom();
	}
	if(game.ImageButton(670, 450, 150, 150, "", "", game.getImage("btPlay"))){
		game.playSound("beep");
		client.emit("ready");
	}

	var y = 70 + 50;
	var x = 10;
	var w = 200;

	var x = (game.width - w * client.getPlayers().length) / (client.getPlayers().length+1); 
	var off = x;
	for(var i = 0; i < client.getPlayers().length; i++){

		game.drawGUIImage(players[i].hud_sprite,x,y,100,100);
		
		game.drawGUIText(x + 120, y + 40, players[i].points,"#FFF","40px " + theme.font); 

		if(readyPlayers[i] == true){
			game.drawCircle(x, y, 20, "green");
		}else if(readyPlayers[i] == false){
			game.drawCircle(x, y, 20, "red");
		}else{
			game.drawCircle(x, y, 20, "black");
		}


		//game.drawGUIText(x+10, y + 325, "WWWWWWWWWWWWWWW");
		game.drawGUILabel(x, y + 130, w, 50, client.getPlayers()[i].username, "black", "30px " + theme.font, "left", "middle");
		

		x += w + off; 
	}
}

function getFirstPlayer(){
	var first = player;
	for(var i = 0; i < players.length; i++){
		if((!first.dead && !players[i].dead) 
			||(first.obj.x < players[i].obj.x && !players[i].dead)){
			first = players[i];
	}
}
return !first.dead ? first : null;
}

function onDisconnect(data){ 
	client.exitRoom();
	notification = new Notification("User has disconnected!")
}

function onPlay(data){
	var p = getPlayer(data.id);
	if(p != null){
		p.x = data.x;
		p.currentBlock = data.currentBlock;
		if(p.hp != data.hp){
			p.createHpEffect();
		}
		p.hp = data.hp;
		p.points = data.points;

		if(data.success){
			p.play(true, playSuccess, data.goX, data.power); 
			effects.push(new Effect(p));
		}else if(data.goX>0){
			p.play(false, playDead, data.goX, data.power); 
		}else{
			p.play(false, playFail, data.goX, data.power);
		}

		if(isOnScreen(p)){
			game.playSound(data.success ?"success":"wrong",0.5);
		}
	}
}

function onNewBlocks(data){

	for(var i = 0; i < data.blocks.length; i++){
		var b = data.blocks[i];
		blocks.push(new game.Image(b.x, b.y, b.w, b.h, game.getImage("block" + b.type)));
	}
}

//CLASSES
function Background(){
	var y = -50;
	var speed = 20;

	this.draw = function(){
		game.drawImage(game.getImage("bg"), -game.offSetX, game.offSetY, 1080, 600);
		game.drawImage(game.getImage("cloud"), -game.offSetX, game.offSetY + y, 1080, 100);

		y+= speed * game.deltaTime;
		if(y > 0 ){
			y = 0;
			speed *= -1;
		}
		if(y<-50){
			y = -50;
			speed *= -1;
		}
	}
}

function destroyEffect(e){
	effectsDestroy.push(e);
}

function Effect(parent){
	this.parent = parent;
	this.offSetY = 0;
	this.a = 1;
	this.font = 20;

	this.draw = function(){
		this.offSetY += game.deltaTime * 100;
		this.a -= game.deltaTime;
		this.font += game.deltaTime*25;
		
		if(this.a < 0){
			this.a = 0;
			destroyEffect(this);
		}

		game.drawText(parent.obj.x + 20, parent.obj.y - this.offSetY, "+1", "rgba(255, 255, 255, "+this.a+")", this.font +"px " + theme.font);
	}
}
function HPEffect(x, y, w, h, img){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.img = img;
	this.grav = -5;
	this.speed = 50;
	this.endY = this.y + 50;
	this.draw = function(){
		this.y += this.speed * this.grav *  game.deltaTime;
		this.grav += game.deltaTime * this.speed/2;
		if(this.grav >= 0){
			this.h -= game.deltaTime * this.speed;
			this.w -= game.deltaTime * this.speed;
			//this.x -= game.deltaTime * this.speed;
		}
		if(this.y >= this.endY){
			destroyEffect(this);
		}
		game.drawGUIImage(this.img, this.x, this.y, this.w, this.h);
	}
}
var police = {
	tilesX: 3,
	tilesY: 4,
	sprite: "police",
	hud:"hud_police",
	animations:[
	{name: "idle", frames:[0,1], ratio: 0.5, loop: true},
	{name: "run", frames:[3,4,5,6,7,8], ratio: 0.1, loop: true},
	{name: "die", frames: [0,9,10,11], ratio: 0.1, loop: false}
	]
};
var unicorn = {
	tilesX: 3,
	tilesY: 3,
	sprite: "unicorn",
	hud:"hud_unicorn",
	animations:[
	{name: "idle", frames:[0,1], ratio: 0.5, loop: true},
	{name: "run", frames: [3,4,5], ratio: 0.1, loop: true},
	{name: "die", frames: [6,7,8,2], ratio: 0.1, loop: false}
	]
};

var characters = {"police": police, "unicorn": unicorn};

console.log(characters);

function Player(id, info, x, y, width, height, character, hp, hud){
	this.id = id;
	this.info = info;
	this.obj = new game.Sprite(x,y,width, height, game.getImage(character.sprite), character.tilesX, character.tilesY);
	this.hud_sprite = game.getImage(character.hud);
	this.hud = hud;
	
	//this.obj.addAnimation("idle", [0,1], 0.5, true);
	//this.obj.addAnimation("run", [3,4,5,6,7,8], 0.1, true);
	//this.obj.addAnimation("die", [0,9,10,11], 0.1, false);
	for(var i = 0; i < character.animations.length; i++){
		var a = character.animations[i];
		this.obj.addAnimation(a.name, a.frames, a.ratio, a.loop);
	}
	this.anim = this.obj.animator;

	this.obj.scale = 1;
	//game
	this.hp = hp;
	this.points = 0;
	this.alive = true;
	this.dead = false;
	this.currentBlock = 0;
	this.action = "idle";
	this.lastX = x;
	this.goX = 0;
	this.callback;
	this.grav = -10;
	
	var _parent = this;
	var _self = this;

	this.reset = function(){
		this.alive = true;
		this.obj.x = this.lastX;
		this.obj.y = gameY - this.obj.height;
	}
	this.play = function(success, callback, goX, power){
		this.bar.barHeight = power;
		if(!this.bar.visible){
			this.bar.visible = true;
		}
		if(success){
			this.goX = goX;
			this.bar.minAngle = 0;
			this.action = "falling1";
		}else if(goX>0){
			this.alive = false;
			this.goX = goX;
			this.bar.minAngle = 0;
			this.action = "falling1";
		}else{
			this.bar.minAngle = -100;
			this.action = "falling2";
		}
		this.callback = callback;
	}
	this.draw = function(){
		this.obj.draw();
		this.bar.draw();
	}
	this.drawGUI = function(){
		var x = this.hud.x;
		var y = this.hud.y;

		for(var j =0; j < this.hp; j++){
			game.drawGUIImage(game.getImage("hp"), x + 80 + (30+5)*j, y+35, 30, 30);
		}
		game.drawGUIImage(this.hud_sprite,x,y,70,70);
		game.drawGUILabel(x, y + 80, 70, 30, this.points,"#FFF","30px " + theme.font, "center", "middle");
		game.drawGUIText(x + 80, y + 15, this.info.username,"black","16px " + theme.font);
	}
	this.createHpEffect = function(){
		var x = this.hud.x;
		var y = this.hud.y;
		effects.push(new HPEffect(x + 80 + (30+5)*(this.hp-1), y+35, 30, 30, game.getImage("hp")));
	}
	this.update = function(){
		if(this.action == "idle"){
			this.anim.play("idle");
		}
		if(this.action == "falling1"){
			if(this.bar.fall()){
				this.action = "run";
			}
		}
		if(this.action == "falling2"){
			if(this.bar.fall()){
				if(this.hp > 0){
					this.action = "idle";
					this.callback(this);
				}else{
					this.grav = -2;
					this.action = "dead";
				}
			}
		}
		if(this.action == "run"){
			this.anim.play("run");
			this.obj.x += game.deltaTime * 180;
			if(this.obj.x > this.goX){
				this.obj.x = this.goX;
				if(this.alive){
					this.lastX = this.goX;
					this.action = "idle";
					this.callback(this);
				}else{
					this.action = "dead";
					this.grav = -2;
					if(isOnScreen(this))
							game.playSound("fall");
				}
			}
		}
		if(this.action == "dead"){
			this.anim.play("die");
			this.obj.y += this.grav * game.deltaTime * 100;
			this.grav += game.deltaTime * 10;

			if(this.obj.y > 600){
				this.action = "idle";
				client.emit("dead", {id: this.id});
				if(this.hp > 0){
					this.callback(this);
				}else{
					this.alive = false;
					this.dead = true;
					this.bar.reset();
				}
			}
		}
	}

	this.bar = new (function(){
		this.angle = 90;
		this.minAngle = -90;
		this.visible = false;
		this.barHeight = 0;
		this.isFalling = false;

		this.draw = function(){
			if(this.visible){ 
				if(this.isFalling){
					this.fall();
				}
				var block = blocks[_parent.currentBlock];
				var rad = Math.angleToRad(this.angle);
				game.drawLine(block.x + block.width, gameY, 
					block.x + block.width + Math.cos(rad) * this.barHeight, gameY - Math.sin(rad)*this.barHeight, 2, "black");

				//console.log("DRAW BAR " + this.barHeight + " // " + rad + " x: " + (block.x + block.width)  + " y: " + gameY);
			}
		}
		this.setHeight = function(t){
			this.barHeight = t > 1 ? maxBarSize: t*maxBarSize;
		}
		this.reset = function(){
			this.visible = false;
			this.angle = 90;			
		}
		this.fall = function(){	
			if(this.angle > this.minAngle){
				this.angle -= game.deltaTime * 200;
			}
			if(this.angle < this.minAngle){
				if(isOnScreen(_parent)){
					game.playSound("hit")
				}
				this.angle = this.minAngle;
				return true;
			}
			return false;
		}
	})();
}


function onPosition(data){
	players[mPlayer].y = data.y;
}

function isOnScreen(p){
	return p.obj.x < -game.offSetX + game.width && p.obj.x + p.obj.width> -game.offSetX;
}

function Notification(msg){
	
	this.w = 300;
	this.h = 70;
	this.x = game.width - this.w - 10;
	this.y = game.height + this.h + 1;
	this.wY = game.height - this.h - 10;
	this.msg = msg;
	this.currentTime = 0;

	this.draw = function(){
		this.currentTime += game.deltaTime;
		game.drawRect(this.x-2, this.y-2, this.w+1, this.h+1, "#CCCCCC");
		game.drawRect(this.x, this.y, this.w, this.h, "#FFFFFF");
		game.drawGUILabel(this.x, this.y, this.w, this.h, this.msg, "#444444", "20px " + theme.font, "center", "middle");

		this.y -= game.deltaTime * 1000;
		if(this.y < this.wY){
			this.y = this.wY;
		}
		if(this.currentTime > 2){
			destroyNotification();
		}
	}
}
function destroyNotification(){
	this.notification = null;
}
///calsses
