//sources["police"]="/police-man100.png";
//sources["bg"]="/mountainsbg.jpg";
//sources["poney"]="/poney.png";
//sources["heart"]="/heart.png";

var client;
var STATE = {LOAD : 0 , GAME : 1}; 
var state = STATE.LOAD;
var theme = {backgroundColor: "#c6e8f3", loading: "#009bce", nonLoading: "#002a3c", gamefont: "gamefont",
lobbyLight: "rgba(255, 255, 255, 0.9)", lobbyDark:"rgba(0, 155, 196, 0.9)"
};


var game = new Engine("game", 450, 600, {resize : true, click: onClick});
game.start(loading);
game.loadImage("unicorn","/games/flying-unicorns/assets/unicorn.png");
game.loadImage("unicorn2","/games/flying-unicorns/assets/unicorn2.png");
game.loadImage("block1","/games/flying-unicorns/assets/block1.png");
game.loadImage("block2","/games/flying-unicorns/assets/block2.png");
game.loadImage("floor","/games/flying-unicorns/assets/floor.png");
game.loadImage("bg","/games/flying-unicorns/assets/bg.png");

game.loadImage("btPlay","/games/flying-unicorns/assets/button_play.png");
game.loadImage("btBack","/games/flying-unicorns/assets/button_back.png");
game.loadImage("btFind","/games/flying-unicorns/assets/button_find.png");
game.loadImage("btAdd","/games/flying-unicorns/assets/button_add.png");
game.loadImage("btInvites","/games/flying-unicorns/assets/button_invites.png");
game.loadImage("btLogin","/games/flying-unicorns/assets/btLogin.png");

game.loadImage("bgMenu","/games/flying-unicorns/assets/bgmenu.png");
game.loadImage("logo","/games/flying-unicorns/assets/logo.png");

game.loadSound("beep", "/games/flying-unicorns/assets/beep.wav");
game.loadSound("jump", "/games/flying-unicorns/assets/jump.wav");
game.loadSound("hit", "/games/flying-unicorns/assets/hit.wav");

game.load(onLoad);

///////
var players;
var readyPlayers;
var player;
var mPlayer;

var floor = 0;
var gap = 0;
var blocks = [];

var click = false;
var clientTime = 0;

var notification = null;
var effects = [];
var effectsDestroy = [];

function onLoad(){
	client = new client(getServer("flyingUnicorns"), "gamecontainer", 
		{"exitRoom": exitRoom, "createGame": onCreateGame, "findGame": onFindGame});

	client.on("startGame", onStartGame);
	client.on("endGame", onEndGame);
	client.on("ready", onReady);
	client.on("update", onUpdate);
	client.on("userDisconnect", onDisconnect);

	client.login(onLogin);
}

function loading(){
	game.drawRect(0, 0, game.width, game.height, theme.backgroundColor);
	
	game.drawGUILabel(0, game.height - 200, game.width, 50, "Loading...","#444", "20px " + theme.gamefont,"center", "middle");
	game.drawRect(112, game.height - 150, 225, 20, theme.nonLoading);
	game.drawRect(112, game.height - 150, game.getLoading() * 225 / 100, 20, theme.loading);
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

	game.offSetY = 0;
	game.offSetX = 0;

	game.drawImage(game.getImage("bg"), -game.offSetX, 0, game.width + 20, game.height);

	game.drawImage(game.getImage("logo"), -game.offSetX + game.width / 2 - 125, 0, 250, 250);

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

	if(notification != null)
		notification.draw();
}
function loginError(){
	game.drawImage(game.getImage("bg"), -game.offSetX, 0, game.width + 20, game.height);

	game.drawGUILabel(0,game.height - 300, game.width, 100, "You are not logged in!", theme.textColor, theme.font, "center", "middle");
	
	if(game.ImageButton(game.width/2 - 75, game.height - 200, 150, 150, "", "", game.getImage("btLogin"))){
		game.playSound("beep");
		window.location="/login";
	}
}
function doubleLoginError(){
	game.drawImage(game.getImage("bg"), -game.offSetX, 0, game.width + 20, game.height);

	game.drawRect(10, game.height - 150, game.width - 20, 100, "rgba(0,0,0,0.5)");
	game.drawGUILabel(0,game.height - 150, game.width, 100, "You are already playing this game!", "#FFF", "Arial 20px", "center", "middle");
}
function erro(){
	if(game.Button(200, 50, 200, 50, "Login", "white", "blue")){
		window.location="/login";
	}
}

function erro2(){
	if(game.Button(200, 50, 200, 50, "You are already playing this game", "white", "blue")){

	}
}

function lobby(){
	game.drawImage(game.getImage("bg"), -game.offSetX, 0, game.width + 20, game.height);
	var y = 70 + 50;
	var x = 20;
	var colors = ["#009bce", "#002a3c"];
	for(var i = 0; i < 2; i++){
		game.drawRect(x, y, 200, 280, "rgba(255,255,255,0.8)");
		game.drawRect(x, y, 200, 50, "rgba(0,0,0,0.8)");

		if(i < client.getPlayers().length){
			game.drawImage(client.getPlayers()[i].img, x +10, y + 60, 180, 180);
			game.drawImage(client.getPlayers()[i].flag, x+85, y + 245, 30, 30);

			//game.drawGUIText(x+10, y + 325, "WWWWWWWWWWWWWWW");
			game.drawGUILabel(x, y, 200, 50, client.getPlayers()[i].username,"white", "20px " + theme.gamefont,"center", "middle");
		}else{
			game.drawGUILabel(x, y, 200, 50, "Waiting for Player...","white", "20px " + theme.gamefont,"center", "middle");
			if(game.Button(x + 10, y + 200, 180, 50, "+ Invite", "white", "#002a3c")){
				client.invite();
			}
		}

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

function onClick(mouse){
	if(state == STATE.GAME){
		
		click = true;
		
	}
}

var serverPos = new game.Rect(0,0,0,0, "rgba(255,0,0,0.5)");
var wantedPos = new game.Rect(0,0,0,0, "rgba(0,0,255,0.5)");
var currentPos = new game.Rect(0,0,0,0, "rgba(0,255,0,0.5)");
var deadPos = new game.Rect(0,0,0,0, "rgba(0,255,255,0.5)");
var collision = new game.Rect(0,0,0,0, "rgba(255,0,255,0.5)");
var floorX = 0;

function update(){
	clientTime += game.deltaTime;
	///UPADTE
	for(var i = 0; i < players.length; i++){
		players[i].update();
	}
	if(players[1] == undefined){
		game.setCamera(players[0].obj.x - 120,0);
	}else if(!players[0].dead && players[0].obj.x > players[1].obj.x){
		game.setCamera(players[0].obj.x - 120,0);
	}else if(players[1] != undefined && !players[1].dead && players[1].obj.x > players[0].obj.x){
		game.setCamera(players[1].obj.x - 120,0);
	}
	
	game.drawImage(game.getImage("bg"), -game.offSetX, 0, game.width + 20, game.height);

	//DRAW
	for(var i = 0; i < blocks.length; i++){
		blocks[i].draw();
	}
	//floor
	if(state != STATE.ENDGAME && !players[0].dead && (players[1] == undefined || !players[1].dead)){
		floorX -= game.deltaTime * 100;
		if(floorX < -23){
			floorX = 0;
		}
	}
	game.drawImage(game.getImage("floor"), -game.offSetX + floorX, game.height - floor, game.width + 20, floor);
	for(var i = 0; i < players.length; i++){
		players[i].draw();
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
	var y = 10;
	var x = 10;
	if(state != STATE.ENDGAME){
		for(var i = 0; i < players.length; i++){
			game.drawCircle(x+5, y-5, 60, "white")
			game.drawGUICircleImage(client.getPlayers()[i].img, x + 10, y, 50, 50);
			if(!players[i].alive)
				game.drawCircle(x+5, y-5, 60, "rgba(0,0,0,0.8)");
			game.drawGUILabel(x + 5, y + 60, 60, 20, client.getPlayers()[i].username,"white", "15px " + theme.gamefont,"center", "middle");

			game.drawGUILabel(x+60, y + 10, 50, 30, players[i].points,"white", "30px " + theme.gamefont,"center", "middle");


			x+= 180;
		}
	}

	//END GAME
	if(state == STATE.ENDGAME){
		game.drawGUIRect(0,0, game.width, game.height, "rgba(0,0,0, 0.8)");

		y = 100;
		x = 20;
		for(var i = 0; i < players.length; i++){
			game.drawCircle(x+60, y - 15, 20, readyPlayers[i] ? "green" : "white");
			game.drawCircle(x+50, y, 120, "white");
			game.drawGUICircleImage(client.getPlayers()[i].img, x + 60, y +10, 100, 100);

			game.drawGUILabel(x+50, y + 120, 120, 50, client.getPlayers()[i].username,"white", "20px " + theme.gamefont,"center", "middle");

			game.drawGUILabel(x+50, y + 160, 120, 50, players[i].points,"white", "40px " + theme.gamefont,"center", "middle");


			x+= 220;
		}



		if(game.ImageButton(83, 450, 100, 100, "", "", game.getImage("btBack"))){
			game.playSound("beep");
			client.exitRoom();
		}

		if(game.ImageButton(266, 450, 100, 100, "", "", game.getImage("btPlay"))){
			game.playSound("beep");
			client.emit("ready");
		}
	}

	if(click){
		click = false;
		client.emit("jump", {})
	}
}

////
var b =0;

function jump(){
	if(state == STATE.GAME && !player.dead){
		//client.emit("play", {type: type});
	}
}

////SERVER RESPONSES
function onStartGame(data){
	clientTime = 0;
	players = [];
	blocks = [];
	effects = [];
	effectsDestroy = [];
	readyPlayers = [undefined, undefined];

	for(var i = 0; i< data.players.length; i++){
		players.push(new Player(data.players[i].id, client.getPlayer(data.players[i].id), data.players[i].x, data.players[i].y, data.playerWidth, data.playerHeight, game.getImage(i == 0 ? "unicorn" : "unicorn2")));

		if(data.players[i].id == client.getID()){
			mPlayer = i;
			player = players[i];
		}
	}
	onNewBlocks(data);
	floor = data.floor;
	gap = data.gap;

	game.update = update;
	state  = STATE.LOAD;
	client.emit("ready", {});
}
function onUpdate(data){
	for(var i = 0; i < players.length; i++){
		players[i].positions.push(data.players[i]);
		if(players[i].positions.length>20){
			players[i].positions.splice(0,1);
		}

		if(mPlayer == i && !data.players[i].alive){
			mPlayer = 10;
		}
	}
	clientTime = data.t - 0.1;
}
function onDisconnect(data){ 
	client.exitRoom();
	notification = new Notification("User has disconnected!")
}
function onEndGame(data){
	state  = STATE.ENDGAME;
	readyPlayers = [undefined, undefined];
}

function onReady(data){

	if(state == STATE.LOAD){
		state = STATE.GAME;
	}
	if(state == STATE.ENDGAME){
		var index = getPlayerId(data.id);
		if(index!=-1){
			readyPlayers[index] = data.state;
		}
	}
}

function onNewBlocks(data){
	for(var i = 0; i < data.blocks.length; i++){
		blocks.push(new Block(data.blocks[i].id, data.blocks[i].x, data.blocks[i].y, data.blocks[i].w, data.blocks[i].h, game.getImage("block1"), game.getImage("block2")));
	}
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

function Player(id, info,  x, y, w, h, sprite){
	//var isRemote = remote;
	this.id = id;
	this.info = info;
	this.obj = new game.Sprite(x, y, w, h, sprite, 3, 1);
	this.obj.addAnimation("idle", [0,1, 2,1], 0.1, true);

	this.action = "idle";
	this.alive = true;
	this.dead = false;

	this.block = 0;
	this.points = 0;

	this.positions = [];
	this.lerped = 0;
	this.jumping = 0;

	this.update = function(){
		var target = null;
		var previous = null;
		var count = this.positions.length -1;

		for(var i = 0; i < count; ++i) {

			var point = this.positions[i];
			var next_point = this.positions[i+1];

			if(clientTime > point.t && clientTime < next_point.t) {
				target = next_point;
				previous = point;
				break;
			}
		}

		if(target && previous) {
			var time = game.deltaTime*15;
			this.obj.rotation =  game.lerp(this.obj.rotation , target.rotation, time);
			this.obj.x = game.lerp(this.obj.x, target.x, time);
			this.obj.y = game.lerp(this.obj.y, target.y, time);
			var lastAlive = this.alive;
			var lastJump = this.jumping;
			this.jumping = target.jump;
			this.alive = previous.alive;
			this.dead = previous.dead;
			if(this.points < previous.points){
				this.points = previous.points;
				effects.push(new Effect(this));
			}
			if(!this.alive){
				this.obj.animator.stop();
			}
			if(lastAlive && !this.alive){
				game.playSound("hit");
			}
			if(lastJump <this.jumping){
				game.playSound("jump");
			}

			
		}
	}

	this.draw = function(){
		game.drawRect(this.obj.x-10, this.obj.y - 20,  70, 20, "rgba(0,0,0,0.5)");
		game.drawLabel(this.obj.x-10, this.obj.y - 20,  70, 20, this.info.username,  "white", "12px "+ theme.gamefont, "center", "middle");
		this.obj.draw();
	}
}

function Block(id, x,y,w,h,s1, s2){
	this.id = id;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.image1 = s1;
	this.image2 = s2;

	this.draw = function(){
		game.drawImage(this.image2, this.x, this.y, this.width, this.height);
		game.drawImage(this.image1, this.x, this.y - gap - this.height, this.width, this.height);
	}
	this.id = id;
}

function getBlock(id){
	for(var i = 0; i< blocks.length; i++){
		if(blocks[i].id == id){
			return i;
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
		game.drawGUILabel(this.x, this.y, this.w, this.h, this.msg, "#444444", "20px " + theme.gamefont, "center", "middle");

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

		game.drawText(parent.obj.x + 20, parent.obj.y - this.offSetY, "+1", "rgba(255, 255, 255, "+this.a+")", this.font +"px " + theme.gamefont);
	}
}
function destroyEffect(e){
	effectsDestroy.push(e);
}
///calsses
