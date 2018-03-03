//sources["police"]="/police-man100.png";
//sources["bg"]="/mountainsbg.jpg";
//sources["poney"]="/poney.png";
//sources["heart"]="/heart.png";

var client;
var TYPE = {rock : 0, hp: 1, coin:2};
var STATE = {LOAD : 0 , GAME : 1}; 
var state = STATE.LOAD;
var theme = {backgroundColor: "#004400", loading: "#CCC", nonLoading: "#444",
lobbyLight: "rgba(255, 255, 255, 0.9)", lobbyDark:"rgba(0, 155, 0, 0.9)"
};

var game = new Engine("game", 450, 600, {resize : true, click: onClick});
game.start(loading);
game.loadImage("police","/games/dangerous-forest/assets/police.png");
game.loadImage("unicorn","/games/flying-unicorns/assets/unicorn.png");
game.loadImage("block1","/games/flying-unicorns/assets/block1.png");
game.loadImage("block2","/games/flying-unicorns/assets/block2.png");
game.loadImage("floor","/games/flying-unicorns/assets/floor.png");
game.loadImage("bg","/games/dangerous-forest/assets/bg.png");
game.loadImage("rock","/games/dangerous-forest/assets/rock.png");
game.loadImage("rockBroken","/games/dangerous-forest/assets/broken_rock.png");
game.loadImage("hp","/games/dangerous-forest/assets/hp.png");
game.loadImage("hpBroken","/games/dangerous-forest/assets/broken_hp.png");
game.loadImage("coin","/games/dangerous-forest/assets/coin.png");
game.loadImage("coinBroken","/games/dangerous-forest/assets/broken_coin.png");
game.loadImage("hpHud","/games/dangerous-forest/assets/hp_hud.png");
game.loadImage("hpHud2","/games/dangerous-forest/assets/hp_hud2.png");
game.loadImage("card","/games/dangerous-forest/assets/card.png");

game.loadImage("bgMenu","/games/dangerous-forest/assets/bgMenu.png");
game.loadImage("btPlay","/games/dangerous-forest/assets/button_play.png");
game.loadImage("btBack","/games/dangerous-forest/assets/button_back.png");
game.loadImage("btFind","/games/dangerous-forest/assets/button_find.png");
game.loadImage("btAdd","/games/dangerous-forest/assets/button_add.png");
game.loadImage("btInvites","/games/dangerous-forest/assets/button_invites.png");
//game.loadImage("btLogin","/games/flying-unicorns/assets/btLogin.png");

//game.loadImage("bgMenu","/games/flying-unicorns/assets/bgmenu.png");s

game.loadSound("beep", "/games/dangerous-forest/assets/beep.wav");
game.loadSound("hitRock", "/games/dangerous-forest/assets/hit_rock.wav");
game.loadSound("hitHp", "/games/dangerous-forest/assets/hit_hp.wav");
game.loadSound("hitCoin", "/games/dangerous-forest/assets/hit_coin.wav");
game.loadSound("bgMusic", "/games/dangerous-forest/assets/bgMusic.wav");

game.load(onLoad);

///////
var players;
var readyPlayers;
var player;
var mPlayer;

var floor = 0;
var gap = 0;
var blocks = [];
var backgrounds = [];
var click = false;
var clientTime = 0;

var notification = null;
var effects = [];
var hits = [];
var bgMusic = null;
var points = 0;

function onLoad(){
	client = new client(getServer("dangerousForest"), "gamecontainer", 
		{"exitRoom": exitRoom, "createGame": onCreateGame, "findGame": onFindGame});

	client.on("startGame", onStartGame);
	client.on("endGame", onEndGame);
	client.on("ready", onReady);
	client.on("update", onUpdate);
	client.on("newBlock", onNewBlock);
	client.on("hit", onHit);
	client.on("userDisconnect", onDisconnect);

	client.login(onLogin);
}

function loading(){
	game.drawRect(0, 0, game.width, game.height, theme.backgroundColor);
	
	game.drawGUILabel(0, game.height - 200, game.width, 50, "Loading...","#444", "20px Arial","center", "middle");
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
	if(bgMusic != null){
		bgMusic.stop();
		bgMusic = null;
	}
	game.offSetY = 0;
	game.offSetX = 0;

	game.drawImage(game.getImage("bgMenu"), -game.offSetX, 0, game.width + 20, game.height);

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
	game.drawImage(game.getImage("bgMenu"), -game.offSetX, 0, game.width + 20, game.height);
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
			game.drawGUILabel(x, y, 200, 50, client.getPlayers()[i].username,"white", "20px Arial","center", "middle");
		}else{
			game.drawGUILabel(x, y, 200, 50, "Waiting for Player...","white", "20px Arial","center", "middle");
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
		var  x = mouse.x - (player.obj.width/2);
		var y = mouse.y - (player.obj.height/2);

		client.emit("move", {x:x, y: y});
		effects.push(new EffectClick(mouse.x,mouse.y));
	}
}


function update(){
	clientTime += game.deltaTime;
	///UPADTE
	for(var i = 0; i < players.length; i++){
		players[i].update();
	}

	game.drawRect(0, 0, game.width, game.height, "#FFF");
	

	for(var i = 0; i < backgrounds.length; i++){
		backgrounds[i].draw();

		backgrounds[i].y -= game.deltaTime * 160;
	}
	if(backgrounds.length>0 && backgrounds[backgrounds.length-1].y + game.height/2 < game.height){
		backgrounds.push(new game.Image(0,backgrounds[backgrounds.length-1].y + game.height/2, game.width, game.height/2, game.getImage("bg")))
	}

	//game.drawImage(game.getImage("bg"), -game.offSetX, 0, game.width + 20, game.height);

	//DRAW
	
	//floor
	for(var i = 0; i < players.length; i++){
		players[i].obj.draw();
	}

	for(var i = 0; i < blocks.length; i++){
		if(!blocks[i].draw()){
			blocks.splice(i, 1);
			i--;
		} 
	}
	for(var i = 0; i < hits.length; i++){
		if(hits[i].t <= clientTime){
			var index = getBlock(hits[i].id);
			if(index != -1){
				var e;
				if(hits[i].type == TYPE.rock){
					e = HitRockEffect(blocks[index].x, blocks[index].y);
				}
				if(hits[i].type == TYPE.hp){
					e = HitHpEffect(blocks[index].x, blocks[index].y);
				}
				if(hits[i].type == TYPE.coin){
					e = HitCoinEffect(blocks[index].x, blocks[index].y);
				}

				effects.push(new HitEffect(e));
				blocks.splice(index, 1);
			}
		}
	}

	for(var i = 0; i < effects.length; i++){
		if(!effects[i].draw()){
			effects.splice(i, 1);
			i--;
		} 
	}
	game.drawRect(game.width-150, game.height - 50, 150, 30, "rgba(0,0,0,0.5)");
	game.drawGUILabel(game.width-150, game.height - 50, 150, 30, points, "white", "20px Arial","center", "middle");

	var y = 10;
	var x = 10;
	if(state != STATE.ENDGAME){
		for(var i = 0; i < players.length; i++){
			players[i].drawHud();
		}
	}
	
	//END GAME
	if(state == STATE.ENDGAME){
		game.drawGUIRect(0,0, game.width, game.height, "rgba(0,0,0, 0.8)");

		y = 100;
		x = 0;
		for(var i = 0; i < players.length; i++){
			game.drawImage(game.getImage("card"), x + 20, y - 30, 190, 300);
			game.drawCircle(x+60, y - 15, 20, readyPlayers[i] ? "green" : "white");
			game.drawCircle(x+50, y, 120, "white");
			game.drawGUICircleImage(client.getPlayers()[i].img, x + 60, y +10, 100, 100);

			
			game.drawGUILabel(x+50, y + 120, 120, 50, client.getPlayers()[i].username,"white", "20px Arial","center", "middle");

			game.drawGUILabel(x+40, y + 160, 55, 50, "coins", "white", "18px Arial","center", "middle");
			game.drawGUILabel(x+40, y + 190, 55, 50, players[i].coin,"white", "25px Arial","center", "middle");

			game.drawGUILabel(x+130, y + 160, 55, 50, "points", "white", "18px Arial","center", "middle");
			game.drawGUILabel(x+130, y + 190, 55, 50, players[i].points,"white", "25px Arial","center", "middle");

			game.drawRect(x+110, y + 180, 3, 50, "rgba(0,0,0, 0.5)");

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
	hits = [];
	effects = [];
	readyPlayers = [undefined, undefined];

	for(var i = 0; i< data.players.length; i++){
		players.push(new Player(data.players[i].id, client.getPlayer(data.players[i].id), data.players[i].x, data.players[i].y, data.playerWidth, data.playerHeight, data.sprite));

		if(data.players[i].id == client.getID()){
			mPlayer = i;
			player = players[i];
		}
	}
	backgrounds = [
	new game.Image(0,0, game.width, game.height/2, game.getImage("bg")),
	new game.Image(0,game.height/2, game.width, game.height/2, game.getImage("bg"))
	];
	//onNewBlocks(data);
	
	game.update = update;
	state = STATE.LOAD;


	serverPos = new game.Rect(0,0,50,50, "rgba(0,0,255,0.5)");
	userPos = new game.Rect(0,0, 50, 50, "rgba(255,0,0, 0.5)");
	if(bgMusic == null)
		bgMusic = game.playSound("bgMusic", 0.3, true);
	client.emit("ready", {});
}
function onHit(data){
	hits.push(data);
}
function onUpdate(data){
	for(var i = 0; i < players.length; i++){
		players[i].positions.push(data.players[i]);
		if(players[i].positions.length>20){
			players[i].positions.splice(0,1);
		}
	}
	for(var i = 0; i < data.blocksInfo.length; i++){
		var info = data.blocksInfo[i];
		var index = getBlock(info.id);
		if(index != -1){
			var block = blocks[index];
			block.positions.push(info);
			
			if(block.positions.length > 10){
				block.positions.splice(0,1);
			}
		}
	}
	clientTime = data.t - 0.1;
	points = data.points;
}
function onDisconnect(data){ 
	client.exitRoom();
	notification = new Notification("User has disconnected!")
}
function onEndGame(data){
	state  = STATE.ENDGAME;
	readyPlayers = [undefined, undefined];
	for(var i = 0; i < data.info.length;i++){
		players[i].points = data.info[i].points;
		players[i].coin = data.info[i].coin;
	}
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

function onNewBlock(data){
	var img = game.getImage("rock");

	if(data.type == TYPE.rock)
		img = game.getImage("rock")
	if(data.type == TYPE.hp)
		img = game.getImage("hp")

	if(data.type == TYPE.coin)
		img = game.getImage("coin")

	blocks.push(new Block(data.id, data.x, data.y, data.w, data.h, img));
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
var serverPos;
var userPos;

function Player(id, info,  x, y, w, h, sprite){

	this.id = id;
	this.info = info;
	this.obj = new game.Sprite(x, y, w, h, game.getImage("police"), 4, 2);
	this.obj.addAnimation("run", [0,1,2,3], 0.12, true);
	this.obj.addAnimation("die", [4,5,6,7], 0.1, false);

	this.action = "idle";
	this.alive = true;
	this.dead = false;
	this.hp = 2;
	this.coin = 0;
	this.points = 0;
	this.positions = [];

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

			this.obj.x = game.lerp(this.obj.x, target.x, time);
			this.obj.y = game.lerp(this.obj.y, target.y, time);
			this.coin = target.coin;
			this.hp = target.hp;
			if(this.alive && !target.alive){
				this.alive = false;
				this.obj.animator.play("die");
			}
		}
	}
	var hpW = this.obj.width/2;
	this.drawHud = function(){
		//game.drawGUILabel(this.obj.x, this.obj.y - 30, this.obj.width/2, 10, this.coin, "black", "15px Arial", "center", "middle");
		game.drawGUILabel(this.obj.x, this.obj.y - 17, this.obj.width, 10, this.info.username, "black", "12px Arial", "center", "middle");
		
		
		game.drawImage(game.getImage(this.hp >= 1 ? "hpHud" : "hpHud2"),this.obj.x + this.obj.width / 2 - 15, this.obj.y-35, 15, 15);
		game.drawImage(game.getImage(this.hp >= 2 ? "hpHud" : "hpHud2"),this.obj.x +this.obj.width/2, this.obj.y - 35, 15, 15);
	}
}

function Block(id, x,y,w,h,img){
	this.id = id;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.image = img;

	this.positions = [];

	this.draw = function(){

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
			var time = game.deltaTime * 10;

			this.x = game.lerp(this.x, target.x, time);
			this.y = game.lerp(this.y, target.y, time); 
		}

		game.drawImage(this.image, this.x, this.y, this.width, this.height);

		return this.y + this.height > - this.height / 2;
	}
}

function getBlock(id){
	for(var i = 0; i< blocks.length; i++){
		if(blocks[i].id == id){
			return i;
		}
	}
	return -1;
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
			return false;
		}

		game.drawText(parent.obj.x + 20, parent.obj.y - this.offSetY, "+1", "rgba(255, 255, 255, "+this.a+")", this.font +"px Arial");
		return true;
	}
}
function HitRockEffect(x,y){
	game.playSound("hitRock");
	var s = new game.Sprite(x - 25, y- 25, 100, 100, game.getImage("rockBroken"),4,1); 
	s.addAnimation("destroy", [0,1,2,3], 0.1, false);
	return s;
}
function HitHpEffect(x,y){
	game.playSound("hitHp");
	var s = new game.Sprite(x - 25, y- 25, 100, 100, game.getImage("hpBroken"),4,1);
	s.addAnimation("destroy", [0,1,2,3], 0.1, false);
	return s;
}
function HitCoinEffect(x,y){
	game.playSound("hitCoin");
	var s = new game.Sprite(x - 25, y- 25, 100, 100, game.getImage("coinBroken"),4,1);
	s.addAnimation("destroy", [0,1,2,3], 0.1, false);
	return s;
}
function HitEffect(sprite){
	this.sprite = sprite;

	this.draw = function(){
		this.sprite.y-= game.deltaTime * 200;
		this.sprite.draw();

		return this.sprite.animator.isPlaying;
	}
}
function destroyEffect(e){
	effectsDestroy.push(e);
}

function EffectClick(x, y){
	
	this.ratio = 10;
	this.x = x - this.ratio / 2;
	this.y = y - this.ratio / 2;
	this.grow = 0;
	this.a = 0.3;
	this.alive = true;

	this.draw = function(){
		var off = (this.ratio - 10) / 2;
		game.drawCircle(this.x - off, this.y - off, this.ratio, "rgba(0,50,0,"+this.a+")");
		if(this.a > 0){
			this.ratio += game.deltaTime* 300; 
			this.a -= game.deltaTime;
			return true;
		}
		return false;
	}
}
///calsses
