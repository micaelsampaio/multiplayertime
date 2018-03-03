//sources["police"]="/police-man100.png";
//sources["bg"]="/mountainsbg.jpg";
//sources["poney"]="/poney.png";
//sources["heart"]="/heart.png";

var client;
var STATE = {LOAD : 0 , GAME : 1}; 
var state = STATE.LOAD;
var towerWidth = 135;
var towerHeigth = 500;
var towerX = (450 / 2) - towerWidth/2;
var pos = [towerX - 80 - 65, towerX + towerWidth + 80];
var theme = {backgroundColor: "#c6e8f3", loading: "#009bce", nonLoading: "#002a3c",
lobbyLight: "rgba(255, 255, 255, 0.9)", lobbyDark:"rgba(0, 155, 196, 0.9)"
};

var game = new Engine("game", 450, 600, {resize : true});
game.start(loading);
game.loadImage("tower1","/games/from-the-tower/assets/tower1.png");
game.loadImage("tower2","/games/from-the-tower/assets/tower2.png");
game.loadImage("tower3","/games/from-the-tower/assets/tower3.png");
game.loadImage("cloud1","/games/from-the-tower/assets/cloud1.png");
game.loadImage("cloud2","/games/from-the-tower/assets/cloud2.png");
game.loadImage("block","/games/from-the-tower/assets/platform.png");
game.loadImage("hp","/games/from-the-tower/assets/hp.png");
game.loadImage("hud_police","/games/from-the-tower/assets/hud_police.png");
game.loadImage("hud_unicorn","/games/from-the-tower/assets/hud_unicorn.png");

game.loadImage("unicorn","/games/from-the-tower/assets/unicorn.png");
game.loadImage("police","/games/from-the-tower/assets/police.png");

game.loadImage("btPlay","/games/from-the-tower/assets/button_play.png");
game.loadImage("btBack","/games/from-the-tower/assets/button_back.png");
game.loadImage("btFind","/games/from-the-tower/assets/button_find.png");
game.loadImage("btAdd","/games/from-the-tower/assets/button_add.png");
game.loadImage("btInvites","/games/from-the-tower/assets/button_invites.png");

game.loadImage("bgMenu","/games/from-the-tower/assets/bgmenu.png");

game.loadSound("unicornJump", "/games/from-the-tower/assets/jump.wav");
game.loadSound("policeJump", "/games/from-the-tower/assets/jump.wav");
game.loadSound("unicornDie", "/games/from-the-tower/assets/explosion.wav");
game.loadSound("policeDie", "/games/from-the-tower/assets/fall.wav");

game.loadSound("bgMusic", "/games/from-the-tower/assets/bgMusic.mp3");
game.loadSound("beep", "/games/from-the-tower/assets/beep.wav");
game.load(onLoad);


/////////
var canvas = game.canvas;
var context = canvas.getContext('2d');
var notification = null;

canvas.addEventListener(game.isMobile() ? 'touchstart' : 'click', function(evt) {
	if(state == STATE.GAME){
		var mousePos = game.getMousePos(evt);

		if(mousePos.x < game.canvas.width/2){
			play(0);
		}else{
			play(1);
		}
	}
}, false);

///////
var players;
var readyPlayers;
var player;
var mPlayer;

var fps = 0;

var canClick = true;
var CameraY = 0;

var blocks = [];
var towers = [];
var towersPattern = [];
var destroyTowers = [];
var currentTower;
var currentTowerY = 0;
var bgMusic;

function onLoad(){
	blocks = [];
	players =[];
	
	client = new client(getServer("fromTheTowerServer"), "gamecontainer", 
		{"exitRoom": exitRoom, "createGame": onCreateGame, "findGame": onFindGame});

	client.on("startGame", onStartGame);
	client.on("endGame", onEndGame);
	client.on("onPlay", onPlay);
	client.on("ready", onReady);
	client.on("userDisconnect", onDisconnect);
	client.on("newBlocks", onNewBlocks);
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
//GAME FUNCTIONS

var destroyBlocks = [];
var cloud = new Cloud();


function loading(){
	game.drawRect(0, 0, game.width, game.height, theme.backgroundColor);
	
	game.drawGUILabel(0, game.height - 200, game.width, 50, "Loading...","#444", "20px Arial","center", "middle");
	game.drawRect(112, game.height - 150, 225, 20, theme.nonLoading);
	game.drawRect(112, game.height - 150, game.getLoading() * 225 / 100, 20, theme.loading);
}
function onCreateGame(){
	game.update = lobby;
}
function onFindGame(room){
	if(room != null){
		game.update = lobby;
	}else{
		game.update = erro;
	}
}
function menu(){
//if(game.Button(200, 50, 200, 50, "CREATE GAME", "white", "blue")){
	if(bgMusic != null){
		bgMusic.stop();
		bgMusic = null;
	}
	game.offSetY = 0;
	game.offSetX = 0;

	game.drawImage(game.getImage("bgMenu"),0,0, game.width, game.height);
	if(game.ImageButton(25, 450, 100, 100, "", "", game.getImage("btInvites"))){
		game.playSound("beep");
		client.invites();
	}

	if(game.ImageButton(325, 450, 100, 100, "", "", game.getImage("btFind"))){
		game.playSound("beep");
		client.findGame();
	}

	if(game.ImageButton(150, 425, 150, 150, "", "", game.getImage("btPlay"))){
		game.playSound("beep");
		client.createGame();
	}

	if(notification)
		notification.draw();
}

function erro(){
	if(game.Button(200, 50, 200, 50, "Login", "white", "blue")){
		game.playSound("beep");
		window.location="/login";
	}
}
function loginError(){
	game.drawImage(game.getImage("bgMenu"), 0,0, game.width, game.height);

	game.drawGUILabel(0,game.height - 200, game.width, 100, "You are not logged in!", theme.textColor, theme.font, "center", "middle");
	if(game.ImageButton(150, game.height - 150, 150, 150, "", "", game.getImage("btLogin"))){
		game.playSound("beep");
		window.location="/login";
	}
}
function doubleLoginError(){
	game.drawImage(game.getImage("bgMenu"), 0,0, game.width, game.height);
	game.drawRect(10, game.height - 150, game.width - 20, 100, "rgba(0,0,0,0.5)");
	game.drawGUILabel(0,game.height - 150, game.width, 100, "You are already playing this game!", "#FFF", "Arial 20px", "center", "middle");
}

function lobby(){
	//console.log(client.getPlayers());
	game.drawImage(game.getImage("bgMenu"),0,0, game.width, game.height);

	var y = 70 + 50;
	var x = 20;
	var colors = ["#009bce", "#002a3c"];
	for(var i = 0; i < 2; i++){
		game.drawRect(x, y, 200, 280, theme.lobbyLight);
		game.drawRect(x, y, 200, 50, theme.lobbyDark);

		if(i < client.getPlayers().length){
			game.drawImage(client.getPlayers()[i].img, x +10, y + 60, 180, 180);
			game.drawImage(client.getPlayers()[i].flag, x+85, y + 245, 30, 30);

			//game.drawGUIText(x+10, y + 325, "WWWWWWWWWWWWWWW");
			game.drawGUILabel(x, y, 200, 50, client.getPlayers()[i].username,"white", "20px Arial","center", "middle");
		}else{
			game.drawGUILabel(x, y, 200, 50, "Waiting for Player...","white", "20px Arial","center", "middle");
			if(game.Button(x + 10, y + 200, 180, 50, "+ Invite", "white", "#002a3c")){
				game.playSound("beep");
				client.invite();
			}
		}

		game.drawGUIImage(game.getImage("hud_" + (i == 0 ? "police" : "unicorn")),x -20,y-20,40,40);

		x+= 220;
	}

	if(game.ImageButton(83, 450, 100, 100, "", "", game.getImage("btBack"))){
		game.playSound("beep");
		client.exitRoom();
	}

	if(game.ImageButton(266, 450, 100, 100, "", "", game.getImage("btPlay"))){
		game.playSound("beep");
		client.startGame();
	}
}
function exitRoom(){
	game.update = menu; 
}

function update(){
	
	///UPADTE
	for(var i = 0; i < players.length; i++){
		players[i].update();
	}
	
	game.setCamera(0, CameraY - 350);


	//DRAW
	game.drawRect(0, CameraY-350, 450, 450, "#9fcfe5");

	cloud.draw();

	var t = 0;
	for(var i = 0; i < towers.length; i++){
		if(towers[i].y < CameraY + 300 && towers[i].y > CameraY - 1000){
			towers[i].draw();
			t++;
		}
	}

	var b = 0;
	for(var i = 0; i < blocks.length; i++){
		if(blocks[i].obj.y > CameraY - 350 && blocks[i].obj.y < CameraY + 350){
			blocks[i].obj.draw();
			b++;
			//destroyBlocks.push(blocks[i]);
		}
	}

	for(var i = 0; i < players.length; i++){
		players[i].obj.draw();
	}


	for(var i = 0; i < players.length; i++){
		var x = 10 + (300*i);
		var y = 500;
		for(var j =0; j < players[i].hp; j++){
			game.drawGUIImage(game.getImage("hp"), x + (30+5)*j, y+45, 30, 30);
		}
		game.drawGUIImage(game.getImage("hud_" + (i == 0 ? "police" : "unicorn")),x,y,40,40);
		game.drawGUIText(x + 50, y, players[i].points,"#000","30px Arial");
		game.drawGUIText(x, y - 30, players[i].info.username,"#000","20px Arial");
		//game.drawGUIText(players[i].x, players[i].y -10, players[i].id);
	}

	//game.drawRect(0, -game.offSetY, game.width, game.height, "rgba(0,0,0,0.2)");

	if(towers.length > 0){
		if(towers[towers.length-1].y > (-game.offSetY - 700)){
			newTower();
		}
	}
	//if(destroyBlocks.length>0)
	//destroyBlocks =[];*/
	game.drawGUIText(10, 20, game.getFPS());

	if(state == STATE.ENDGAME){
		game.drawGUIRect(0, 0, game.width, game.height, "rgba(0,0,0,0.9)");

		if(game.ImageButton(83, 450, 100, 100, "", "", game.getImage("btBack"))){
			game.playSound("beep");
			client.exitRoom();
		}

		if(game.ImageButton(266, 450, 100, 100, "", "", game.getImage("btPlay"))){
			game.playSound("beep");
			client.emit("ready");
		}
		
		var endX = 16;
		var endY = 100;
		for(var i = 0; i < players.length; i++){
			game.drawGUILabel(endX, endY, 200, 50, players[i].info.username,"#fff","22px Arial", "center", "middle");
			game.drawGUIImage(game.getImage("hud_" + (i == 0 ? "police" : "unicorn")),endX + 50, endY+ 50 ,100,100);
			game.drawGUILabel(endX, endY + 160, 200, 50, players[i].points,"#fff","30px Arial", "center", "middle");

			if(readyPlayers[i] == true){
				game.drawCircle(endX + 85, endY + 220, 30, "green");
			}else if(readyPlayers[i] == false){
				game.drawCircle(endX + 85, endY+ 220, 30, "red");
			}else{
				game.drawCircle(endX + 85, endY+ 220, 30, "white");
			}

			endX += 216;
		}
	}
}

////
var b =0;
function goLeft(){
	play(0);
}
function goRight(){
	play(1);
}

function play(type){
	if(canClick){
		client.emit("play", {type: type});
	}
}

////SERVER RESPONSES
function onStartGame(data){
	console.log(data);

	if(bgMusic == null){
		bgMusic = game.playSound("bgMusic", 0.2, true);
	}
	players = [];
	blocks = [];
	readyPlayers = [undefined, undefined];

	onNewBlocks(data);
	for(var i = 0; i< data.players.length; i++){
		players.push(new Player(data.players[i].id, client.getPlayer(data.players[i].id), data.players[i].x, data.players[i].y, data.playerWidth, data.playerHeight, i == 0 ? "police" : "unicorn", data.hp));

		if(data.players[i].id == client.getID()){
			player = players[i];
			CameraY = player.obj.y;
		}
	}

	towersPattern = data.towers;
	currentTower = 0;
	towers = [];
	destroyTowers = [];
	currentTowerY = 500;
	
	newTower();
	newTower();
	newTower();
	newTower();
	newTower();
	newTower();

	canClick = true;

	game.update = update;
	state  = STATE.LOAD;
	client.emit("ready", {});
}
function onEndGame(data){
	state  = STATE.ENDGAME;
	
	for(var i = 0; i < data.points.length; i++){
		var p = getPlayer(data.points[i].id);
		if(p != null){
			p.points = data.points[i].points;
		}
	}

	setTimeout(function(){
		readyPlayers = [undefined, undefined];
		game.offSetX = 0;
		game.offSetY = 0;
		state = STATE.ENDGAME;
	}, 1000);
	
}

function onReady(data){
	console.log("READY " + data);

	if(state == STATE.LOAD){
		state = STATE.GAME;
		console.log("can play");
	}
	if(state == STATE.ENDGAME){
		var index = getPlayerId(data.id);
		if(index!=-1){
			readyPlayers[index] = data.state;
		}

		console.log("READY " + readyPlayers);
	}
}
function newTower(){
	towers.push(new game.Image(towerX, currentTowerY, 135, 500, game.getImage("tower"+(towersPattern[currentTower] +1))));
	currentTowerY-= 500;
	currentTower++;
	if(currentTower>=towersPattern.length){
		currentTower = 0;
	}
}

function onNewBlocks(data){
	for(var i = 0; i < data.blocks.length; i++){
		blocks.push(new Block(data.blocks[i].id, data.blocks[i].type, data.blocks[i].x, data.blocks[i].y, data.blocks[i].w, data.blocks[i].h, game.getImage("block")));
	}
}
function onDisconnect(data){ 
	client.exitRoom();
	notification = new Notification("User has disconnected!")
}
function onPlay(data){ 
	console.log(data);

	var p  = getPlayer(data.id);

	if(p!=null){
		p.obj.x = data.x;
		p.obj.y = data.y;
		p.obj.scale = data.scale;
		p.block  = getBlock(data.block);

		p.dieX = data.nx;
		p.dieY = data.y;
		p.points = data.points;

		if(data.success){
			p.anim.play("jump");
			p.anim.stop();
			if(isOnScreen(p))
				game.playSound(p.jumpSound);
			p.action = 'jump';
		}else{
			p.hp-=1;
			if(p == player){
				canClick = false;
			}
			p.action = 'die';
		}

		if(p == player)
			CameraY = p.obj.y;

		if(p != player && !player.alive)
			CameraY = p.obj.y;
	}
}
function isOnScreen(p){
	return p.obj.y > -game.offSetY - p.obj.height && p.obj.y < -game.offSetY + game.height;
}
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
//Classes

function Player(id, info,  x, y, w, h, sprite, hp){
	//var isRemote = remote;
	this.id = id;
	this.info = info;
	this.obj = new game.Sprite(x, y, w, h, game.getImage(sprite), 3, 3);
	this.obj.addAnimation("idle",[0,1], 0.3, true);
	this.obj.addAnimation("jump",[3,4,5,0], 0.05, false); 
	this.obj.addAnimation("die",[6,7,8], 0.05, false); 
	this.anim = this.obj.animator;
	this.action = "idle";
	this.goY = 0;
	this.obj.scale = 1;
	this.alive = true;
	this.dieX = 0;
	this.dieY = 0;

	this.jumpSound = sprite + "Jump";
	this.dieSound = sprite + "Die";
	this.hp = hp;
	this.points = 0;

	this.deadTime = 0;


	this.update = function(){
		if(this.action == 'idle'){
			this.anim.play("idle");
		}
		if(this.action == 'jump'){
			this.anim.play("jump");
			if(!this.anim.isPlaying){
				this.action = 'idle';
			}
		}
		if(this.action == 'die'){
			this.anim.play("jump");
			if(!this.anim.isPlaying){
				if(isOnScreen(this))
					game.playSound(this.dieSound);
				this.action = 'fall';
				this.anim.play("die");
				this.deadTime = 0;
			}
		}
		if(this.action == 'fall'){
			this.obj.y += game.deltaTime * 100;
			this.deadTime += game.deltaTime;

			if(this.deadTime>1){
				if(this.hp > 0){
					canClick = true;
					this.action = "jump";
					//TODO
					this.obj.x = this.dieX;
					this.obj.y = this.dieY;
					this.obj.scale*=-1;
				}else{
					this.alive = false;
					this.action = "none";
					this.obj.x  = -200;
				}
			}
		}
	}

	this.setPosition = function(){
		this.obj.scale = this.block.type == 0 ? 1 : -1;
		this.obj.x = pos[this.block.type] - this.obj.width/2;
		this.obj.y = this.block.obj.y-this.obj.height;
	}

	//this.changeBlock(0);
}

function Block(id, type, x,y,w,h,s){
	this.obj = new game.Image(x,y,w,h, s);
	this.obj.scale = type == 0 ? 1 : -1;
	this.id = id;
	this.type = type;
}

function getBlock(id){
	for(var i = 0; i< blocks.length; i++){
		if(blocks[i].id == id){
			return i;
		}
	}
}

function Cloud(){
	this.offsetY = 0;
	this.vel = 25;
	this.draw = function(){
		this.offsetY += game.deltaTime * this.vel;
		if(this.vel>0 && this.offsetY>35){
			this.offsetY = 35;
			this.vel *=-1;
		}
		if(this.vel<0 && this.offsetY<0){
			this.offsetY = 0;
			this.vel *=-1;
		}
		game.drawImage(game.getImage("cloud1"), 0, CameraY - 100 + this.offsetY, 450, 250);
		game.drawImage(game.getImage("cloud2"), 0, CameraY + this.offsetY, 600, 250);
	}
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
		game.drawGUILabel(this.x, this.y, this.w, this.h, this.msg, "#444444", "20px Arial", "center", "middle");

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