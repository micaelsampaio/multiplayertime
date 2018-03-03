//sources["police"]="/police-man100.png";
//sources["bg"]="/mountainsbg.jpg";
//sources["poney"]="/poney.png";
//sources["heart"]="/heart.png";

var client;
var STATE = {LOAD : 0 , GAME : 1, ENDGAME:2, PREEND: 3}; 
var state = STATE.LOAD;
var notification = null;

var game = new Engine("game", 450, 600, {resize : true});

game.start(loading);
game.loadImage("logo","/games/four-in-row/assets/logo.png");
game.loadImage("btStart","/games/four-in-row/assets/button_start_game.png");
game.loadImage("btCreateGame","/games/four-in-row/assets/button_create_game.png");
game.loadImage("btFindGame","/games/four-in-row/assets/button_find_game.png");
game.loadImage("btInvites","/games/four-in-row/assets/button_invites.png");
game.loadImage("btInvite","/games/four-in-row/assets/button_invite.png");
game.loadImage("btBack","/games/four-in-row/assets/button_back.png");
game.loadImage("btLogin","/games/four-in-row/assets/button_login.png");
game.loadImage("container","/games/four-in-row/assets/container.png");
game.loadSound("beep","/games/four-in-row/assets/beep.wav");
game.load(onLoad);

var players;
var readyPlayers;


function onLoad(){
	
	client = new client(getServer("fourInRow"), "gamecontainer", {"exitRoom": exitRoom, "createGame": onCreateGame, "findGame": onFindGame});
	client.on("startGame", onStartGame);
	client.on("onPlay", onPlay);
	client.on("endGame", onEndGame);
	client.on("ready", onReady);
	client.on("userDisconnect", onDisconnect);
	client.login(onLogin);
	//game.update = update;
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

//GAME FUNCTIONS

function loading(){

	game.drawGUIText(200, 50, "Loading"); 
	
}

function menu(){

	game.drawRect(0,0, game.width, game.height,"#3F51B5");

	game.drawImage(game.getImage("logo"), 100,20,250, 250);
	
	if(game.ImageButton(75, 300, 300, 70, "", "", game.getImage("btCreateGame"))){
		game.playSound("beep");
		client.createGame();
	}

	if(game.ImageButton(75, 380, 300, 70, "", "", game.getImage("btFindGame"))){
		game.playSound("beep");
		client.findGame();
	}
	if(game.ImageButton(75, 460, 300, 70, "", "", game.getImage("btInvites"))){
		game.playSound("beep");
		client.invites();
	}

	if(notification != null)
		notification.draw();
}

function loginError(){
	game.drawRect(0,0, game.width, game.height,"#3F51B5");
	game.drawImage(game.getImage("logo"), 100,20,250, 250);

	if(game.ImageButton(75, 460, 300, 70, "", "", game.getImage("btLogin"))){
		game.playSound("beep");
		window.location.href="/login";
	}
}
function doubleLoginError(){
	game.drawRect(0,0, game.width, game.height,"#3F51B5");
	game.drawImage(game.getImage("logo"), 100,20,250, 250);

	game.drawGUILabel(0, game.height - 150, game.width, 100, "You are already playing this game!","white", "25px Arial","center", "middle")
}

function endGame(){
	if(game.Button(200, 50, 200, 50, "PLAY", "white", "blue")){
		client.emit("ready");
	}
}

function lobby(){
	game.drawRect(0,0, game.width, game.height,"#3F51B5");
	game.drawImage(game.getImage("logo"), 165,-10,130, 130);

	var y = 70 + 50;
	var x = 20;
	for(var i = 0; i < 2; i++){
		//game.drawRect(x, y, 200, 300, "white");
		game.drawImage(game.getImage("container"), x,y ,200, 300);
		if(i < client.getPlayers().length){
			game.drawCircle(x +15, y + 15, 170, "#181e45");
			game.drawGUICircleImage(client.getPlayers()[i].img, x +20, y + 20, 160, 160);
			game.drawImage(client.getPlayers()[i].flag, x+85, y + 200, 30, 30);

			//game.drawGUIText(x+10, y + 325, "WWWWWWWWWWWWWWW");
			game.drawGUILabel(x, y + 230, 200, 50, client.getPlayers()[i].username,"white", "25px Arial","center", "middle");
		}else{

			if(game.ImageButton(x + 25, y + 180, 150, 70, "", "", game.getImage("btInvite"))){
				client.invite();
				game.playSound("beep");
			}
		}

		x+= 220;
	}

	if(game.ImageButton(75, 450, 300, 70, "", "", game.getImage("btStart"))){
		client.startGame();
		game.playSound("beep");
	}

	if(game.ImageButton(75, 520, 300, 70, "", "", game.getImage("btBack"))){
		client.exitRoom();
		game.playSound("beep");
	}

}
function exitRoom(){
	game.update = menu; 
}

var startX = 20;
var startY = 200;
var space = 10;
var block = 50;
var lastClick = 0;
var click = 0;
var map = [];
var yourTurn = true;

var horizontal = 7;
var vertical = 6;

var currentPlayer = 0;
var mPlayer = 0;

var colors = ["#FFEA00","#F44336","#0D47A1"];
//animation
var grav = 0;
var uiY = -450;
var trans = 0;
var winner = 0;

var effects = [];
var destroyEffects = [];

var timer;
var hasTimer = true;
var maxTime = 10000;

function onStartGame(data){
	players = [];
	readyPlayers = [undefined, undefined];

	for(var i = 0; i< data.players.length; i++){
		players.push(new Player(data.players[i].id, client.getPlayer(data.players[i].id), data.players[i].points));

		if(data.players[i].id == client.getID()){
			mPlayer = i;
		}
	}
	notification = null;
	map = data.map;
	currentPlayer = data.currentPlayer;
	game.update = update;
	state  = STATE.GAME;

	timer = (new Date()).getTime();
	hasTimer = true;

	client.emit("ready");
}

function update(){
	game.drawRect(0,0, game.width, game.height,"#3F51B5");
	game.drawRect(startX-10, startY-10, (block+space)*7 + 15,(block+space)*6+15,"#1A237E");
	
	var color;
	if(effects.length>0){
		for(var i = 0; i < effects.length; i++){
			effects[i].draw();
			if(!effects[i].alive){
				effects.splice(i, 1);
				i-=1; 
			}
		}
	}

	for(var i = 0; i < vertical; i++){
		for(var j = 0; j <horizontal; j++){
			game.drawCircle(startX + (block + space) * j, startY + (block + space)*i, block, colors[map[i][j]]);
			game.drawCircle(startX + (block + space) * j + 5, startY + (block + space)*i + 5, block - 10, "rgba(0,0,0, 0.5)");
		}
	}

	if(state == STATE.GAME){
		for(var i = 0; i < horizontal; i++){
			if(game.Button(startX + (block + space) * i -5, startY, block + 10, (block)*7, "", "", "rgba(0, 0, 0, 0)")){
				if(lastClick != i){
					lastClick = i;
					click = 1;
				}else{
					click++;
				}

				play(i);
			}
		}
	}

	
	//game.drawGUIText(200, 40, lastClick, "Black", "40px Arial");
	//game.drawGUIText(200, 90, click, "Black", "40px Arial");
	var hudX = 62;
	var hudY = 25;

	for(var i = 0; i < players.length; i++){
		if(hasTimer && currentPlayer == i){
			var newTime = Math.round((10000 - ((new Date()).getTime() - timer)) / 1000);
			game.drawCircle(hudX+100,hudY + 10, 40, "#222");
			game.drawGUILabel(hudX + 100, hudY + 10, 40, 40, newTime > 0 ? newTime : 0, "white", "20px Arial", "center", "middle");
		}
		game.drawCircle(hudX+10,hudY-5,80, currentPlayer == i ? colors[i] : "white");
		game.drawGUICircleImage(players[i].info.img, hudX + 15, hudY, 70, 70);
		game.drawGUILabel(hudX, hudY + 100, 100, 50, players[i].points, "black", "30px Arial", "center", "middle");
		game.drawGUILabel(hudX, hudY + 70, 100, 50, players[i].info.username, "black", "18px Arial", "center", "middle");

		hudX += 224;
	}
	
	if(state == STATE.ENDGAME){
		var uiX = 37;
		uiY+=game.deltaTime * grav * 100;
		trans += game.deltaTime * 2;
		grav += game.deltaTime *10;

		if(uiY>=100){
			uiY = 100;
		}
		if(trans > 0.9){
			trans = 0.9;
		}

		game.drawGUIRect(0,0, game.canvas.width, game.canvas.height, "rgba(0, 0, 0, "+trans+")");
		for(var i = 0; i < players.length; i++){
			game.drawCircle(uiX + 65,uiY-35,20, readyPlayers[i] == true ? "green" : "white");
			game.drawCircle(uiX-5,uiY-5,160, "white");
			game.drawGUICircleImage(players[i].info.img, uiX, uiY, 150, 150);
			game.drawGUILabel(uiX, uiY + 200, 150, 50, players[i].points, "white", "25px Arial", "center", "middle");
			game.drawGUILabel(uiX, uiY + 160, 150, 50, players[i].info.username, "white", "20px Arial", "center", "middle");
			if(winner == i){
				game.drawGUILabel(uiX, uiY + 250, 150, 50, "WINNER", "green", "40px Arial", "center", "middle");
			}	
			uiX+= 225;
		}

		if(winner == -1){
			game.drawGUILabel(125, uiY + 250, 200, 50, "DRAW", "green", "40px Arial", "center", "middle");
		}
		
		//game.drawGUILabel(uiX, uiY + 250, 150, 50, "WINNER", "green", "40px Arial", "center", "middle");

		if(game.ImageButton(75, uiY +330, 300, 70, "", "", game.getImage("btStart"))){
			client.emit("ready");
			game.playSound("beep");
		}

		if(game.ImageButton(75, uiY +410, 300, 70, "", "", game.getImage("btBack"))){
			client.exitRoom();
			game.playSound("beep");
		}
	}

	//game.drawGUIText(10, 10, game.getFPS(), "green");
}

////
function play(column){
	if(currentPlayer == mPlayer){
		var index = getRow(column);
		if(index != -1){
			client.emit("play", {col: column});
		}
	}
}

function getRow(column){
	for(var i = 5; i >=0; i--){
		if(map[i][column] == 2){
			return i;
		}
	}
	return -1;
}

//SERVER

////SERVER RESPONSES
function onReady(data){
	if(state == STATE.LOAD){
		state = STATE.GAME;
	}
	if(state == STATE.ENDGAME){
		var index = getPlayerId(data.id);
		if(index!=-1){
			readyPlayers[index] = true;
		}
	}
}
function onDisconnect(data){
	var index = getPlayerId(data.id);
	if(index != mPlayer){
		client.exitRoom();
		notification = new Notification("User has disconnected!");
	}
}

function onPlay(data){ 
	map[data.row][data.col] = data.player;
	currentPlayer = data.currentPlayer;

	effects.push(new Effect(data.row, data.col));
	game.playSound("beep");

	timer = (new Date()).getTime();
	hasTimer = true;
}

function onEndGame(data){
	hasTimer = false;

	for(var i = 0; i < data.vertices.length-1; i++){
		setTimeout(function(){
			for(var i = 0; i < data.vertices.length; i++){
				effects.push(new Effect(data.vertices[i].row, data.vertices[i].col));
			}
			game.playSound("beep");
		},200*i);
	}
	state = STATE.PREEND;

	grav = 0;
	uiY = -450;
	trans = 0;

	for(var i = 0; i < data.players.length; i++){
		players[i].points = data.players[i].points;
	}
	winner = data.winner;
	if(winner != -1){
		winner = getPlayerId(data.winner);
	}

	

	setTimeout(function(){state = STATE.ENDGAME}, 1000);
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

function Player(id, info, points){
	//var isRemote = remote;
	this.id = id;
	this.info = info;
	this.points = points;

	//this.changeBlock(0);
}

function Effect(i, j){
	this.x = startX + (block + space) * j;
	this.y = startY + (block + space)*i;
	this.ratio = block;
	this.grow = 0;
	this.a = 0.3;
	this.alive = true;

	this.draw = function(){
		var off = (this.ratio - block) / 2;
		game.drawCircle(this.x - off, this.y - off, this.ratio, "rgba(255,255,255,"+this.a+")");
		if(this.a > 0){
			this.ratio += game.deltaTime* 300;
			this.a -= game.deltaTime;
		}else{
			this.alive = false;
		}
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