var client;

//setResize(document.getElementById("gamecontainer"));
var STATE = {LOAD : 0, GAME: 1, ENDGAME:2};
var state = STATE.LOAD;

var theme = { background: "#2E7D32", textColor: "#FFF", font : "60px sueca", fontmedium : "40px sueca", btColor: "#444", btBackground:"#EFEFEF"};

//load images
var game = new Engine("game", 900, 1280, {resize : true});
game.start(loading);
game.loadImage("c_2_of_hearts","/games/sueca/images/2_of_hearts.png");
game.loadImage("c_2_of_spades","/games/sueca/images/2_of_spades.png");
game.loadImage("c_2_of_diamonds","/games/sueca/images/2_of_diamonds.png");
game.loadImage("c_2_of_clubs","/games/sueca/images/2_of_clubs.png");
game.loadImage("c_3_of_hearts","/games/sueca/images/3_of_hearts.png");
game.loadImage("c_3_of_spades","/games/sueca/images/3_of_spades.png");
game.loadImage("c_3_of_diamonds","/games/sueca/images/3_of_diamonds.png");
game.loadImage("c_3_of_clubs","/games/sueca/images/3_of_clubs.png");
game.loadImage("c_4_of_hearts","/games/sueca/images/4_of_hearts.png");
game.loadImage("c_4_of_spades","/games/sueca/images/4_of_spades.png");
game.loadImage("c_4_of_diamonds","/games/sueca/images/4_of_diamonds.png");
game.loadImage("c_4_of_clubs","/games/sueca/images/4_of_clubs.png");
game.loadImage("c_5_of_hearts","/games/sueca/images/5_of_hearts.png");
game.loadImage("c_5_of_spades","/games/sueca/images/5_of_spades.png");
game.loadImage("c_5_of_diamonds","/games/sueca/images/5_of_diamonds.png");
game.loadImage("c_5_of_clubs","/games/sueca/images/5_of_clubs.png");
game.loadImage("c_6_of_hearts","/games/sueca/images/6_of_hearts.png");
game.loadImage("c_6_of_spades","/games/sueca/images/6_of_spades.png");
game.loadImage("c_6_of_diamonds","/games/sueca/images/6_of_diamonds.png");
game.loadImage("c_6_of_clubs","/games/sueca/images/6_of_clubs.png");
game.loadImage("c_queen_of_hearts","/games/sueca/images/queen_of_hearts.png");
game.loadImage("c_queen_of_spades","/games/sueca/images/queen_of_spades.png");
game.loadImage("c_queen_of_diamonds","/games/sueca/images/queen_of_diamonds.png");
game.loadImage("c_queen_of_clubs","/games/sueca/images/queen_of_clubs.png");
game.loadImage("c_jack_of_hearts","/games/sueca/images/jack_of_hearts.png");
game.loadImage("c_jack_of_spades","/games/sueca/images/jack_of_spades.png");
game.loadImage("c_jack_of_diamonds","/games/sueca/images/jack_of_diamonds.png");
game.loadImage("c_jack_of_clubs","/games/sueca/images/jack_of_clubs.png");
game.loadImage("c_king_of_hearts","/games/sueca/images/king_of_hearts.png");
game.loadImage("c_king_of_spades","/games/sueca/images/king_of_spades.png");
game.loadImage("c_king_of_diamonds","/games/sueca/images/king_of_diamonds.png");
game.loadImage("c_king_of_clubs","/games/sueca/images/king_of_clubs.png");
game.loadImage("c_7_of_hearts","/games/sueca/images/7_of_hearts.png");
game.loadImage("c_7_of_spades","/games/sueca/images/7_of_spades.png");
game.loadImage("c_7_of_diamonds","/games/sueca/images/7_of_diamonds.png");
game.loadImage("c_7_of_clubs","/games/sueca/images/7_of_clubs.png");
game.loadImage("c_ace_of_hearts","/games/sueca/images/ace_of_hearts.png");
game.loadImage("c_ace_of_spades","/games/sueca/images/ace_of_spades.png");
game.loadImage("c_ace_of_diamonds","/games/sueca/images/ace_of_diamonds.png");
game.loadImage("c_ace_of_clubs","/games/sueca/images/ace_of_clubs.png");

game.loadImage("btStartGame","/games/sueca/images/button_start_game.png");
game.loadImage("btCreateGame","/games/sueca/images/button_create_game.png");
game.loadImage("btFindGame","/games/sueca/images/button_find_game.png");
game.loadImage("btInvites","/games/sueca/images/button_invites.png");
game.loadImage("btPlayAgain","/games/sueca/images/button_play_again.png");
game.loadImage("btPlay","/games/sueca/images/button_play.png");
game.loadImage("btExit","/games/sueca/images/button_exit.png");
game.loadImage("btAdd","/games/sueca/images/button_add.png");
game.loadImage("btLogin","/games/sueca/images/bt_login.png");
game.loadImage("bg","/games/sueca/images/bg.png");
game.loadImage("logo","/games/sueca/images/logo.png");
game.loadImage("points","/games/sueca/images/points.png");

game.loadImage("bot","/uploads/bot.png"); 

game.loadSound("beep","/games/sueca/sounds/beep.wav");
game.loadSound("card","/games/sueca/sounds/card.wav");
game.loadSound("card2","/games/sueca/sounds/card2.wav");

game.load(onLoad);

//game
var players = [];
var readyPlayers = [];
var mPlayer;
var trunfo;
var round = 0;
var maxRound = 10; 
var turn = 0;
var currentPlayer = 0;
var mPlayer = 0;
var trunfo;
var playedCards = [];
var canPlay = false;

var cardW = 150;
var cardH = 220;
var cardPosition = [];
var highlight = [false, false, false,false, false, false,false, false, false,false];
var pivots = [];

var winText;
var teams;

var isTime = false;
var timer = 0;
var maxTime = 0;
var notification = null;

function onLoad(){
	client = new client(getServer("sueca"), "gamecontainer", {"exitRoom": exitRoom, "createGame": onCreateGame, "findGame": onFindGame});
	client.on("startGame", onStartGame);
	client.on("turn", onTurn);
	client.on("play", onPlay);
	client.on("endGame", onEndGame);
	client.on("continue", onContinue);
	client.on("removeGame", onRemoveGame);
	client.on("userDisconnect", onDisconnect);
	client.on("endTurn", onEndTurn);
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

function onRemoveGame(data){
	client.exitRoom();
}

function loading(){
	game.drawRect(0,0, game.width, game.height, theme.background);
	game.drawGUILabel(0,game.height- 150, game.width, 100, "Loading", theme.textColor, theme.font, "center", "middle");
}

function menu(){
	game.drawImage(game.getImage("bg"), 0,0, game.width, game.height);
	
	if(game.ImageButton(150, 750, 600, 150, "", "", game.getImage("btCreateGame"))){
		game.playSound("beep");
		client.createGame();
		//game.update = lobby;
	}

	if(game.ImageButton(150, 925, 600, 150, "", "", game.getImage("btFindGame"))){
		game.playSound("beep");
		client.findGame();
		//game.update = lobby;
	}
	if(game.ImageButton(150, 1100, 600, 150, "", "", game.getImage("btInvites"))){
		game.playSound("beep");
		client.invites();
	}

	if(notification != null)
		notification.draw();
}
function loginError(){
	game.drawImage(game.getImage("bg"), 0,0, game.width, game.height);

	game.drawGUILabel(0,game.height - 500, game.width, 100, "You are not logged in!", theme.textColor, theme.font, "center", "middle");
	if(game.ImageButton(150, 925, 600, 150, "", "", game.getImage("btLogin"))){
		game.playSound("beep");
		window.location="/login";
	}
}
function doubleLoginError(){
	game.drawImage(game.getImage("bg"), 0,0, game.width, game.height);
	game.drawRect(10, 925, game.width - 20, 100, "rgba(0,0,0,0.3)");
	game.drawGUILabel(0,925, game.width, 100, "You are already playing this game!", theme.textColor, theme.fontmedium, "center", "middle");
}

function onCreateGame(){
	game.update = lobby;
}
function onFindGame(room){
	console.log("ROOM " + room);
	if(room != null){
		game.update = lobby;
	}
}


function endGame(){
	if(game.Button(200, 50, 200, 50, "PLAY", "white", "blue")){
		console.log("CLICK END");
		client.emit("ready");
	}
}

function lobby(){
	game.drawRect(0,0, game.width, game.height, theme.background);
	
	game.drawImage(game.getImage("logo"), game.width/2 - 125, -20, 250, 250);
	//console.log(client.getPlayers());

	var y = 180;
	var x = 100;
	for(var i = 0; i < 4; i++){
		
		game.drawGUICircle(x - 10, y -10, 170, "white");

		if(i < client.getPlayers().length){
			game.drawGUICircleImage(client.getPlayers()[i].img, x, y, 150, 150);
			game.drawImage(client.getPlayers()[i].flag, x+200, y, 60, 60);
			game.drawGUILabel(x + 200, y + 50, 300, 50, client.getPlayers()[i].username,"white", theme.font,"left", "top");
		}else{
			game.drawGUILabel(x + 200, y + 50, 300, 50, "BOT","white", theme.font,"left", "top");
		}

		y += 200;
	}

	if(game.ImageButton(75, 1050, 200, 200, "", "", game.getImage("btExit"))){
		game.playSound("beep");
		client.exitRoom();
	}

	if(game.ImageButton(350, 1050, 200, 200, "", "", game.getImage("btAdd"))){
		game.playSound("beep");
		client.invite();
	}

	if(game.ImageButton(625, 1050, 200, 200, "", "", game.getImage("btPlay"))){
		game.playSound("beep");
		client.startGame();
	}
}
function exitRoom(){
	game.update = menu; 
}

function getPlayer(id){
	for(var i = 0; i < players.length; i++){
		if(players[i].id == id)
			return players[i];
	}
	return null;
}
function getPlayerID(id){
	for(var i = 0; i < players.length; i++){
		if(players[i].info.id == id)
			return players[i];
	}
	return null;
}


//server sends!
function isValidCard(id){
	var remainCards = 0;

	if(playedCards.length > 0){
		for(var i = 0; i < players[0].cards.length; i++){
			if(!players[0].cards[i].played && players[0].cards[i].type == playedCards[0].type){
				remainCards++;
			}
		}
	}

	return playedCards.length == 0 || (remainCards > 0 && playedCards[0].type == players[0].cards[id].type) || remainCards == 0;
}

function playCard(id){
	
	console.log("Play card : " + currentPlayer +" "+ mPlayer +" "+ canPlay + " " + id);
	if(id >= 0 && id <=9 && currentPlayer == mPlayer && canPlay){
		var remainCards = 0;

		if(playedCards.length > 0){
			for(var i = 0; i < players[0].cards.length; i++){
				if(!players[0].cards[i].played && players[0].cards[i].type == playedCards[0].type){
					remainCards++;
				}
			}
		}

		if(playedCards.length == 0 || (remainCards > 0 && playedCards[0].type == players[0].cards[id].type) || remainCards == 0){
			client.emit("playCard", {card: id});
		}else{
			alert("Carta Inválida");
		}
	}
}

function continuePlay() {
	client.emit("ready",{});
}

var cardEffects = [];

/// SERVER Responses
function onStartGame(data){
	console.log(data);
	notification = null;
	state = STATE.LOAD;
	round = 0;
	players = [];
	playedCards = [];
	readyPlayers = [undefined, undefined, undefined, undefined];

	trunfo = data.trunfo.type;
	trunfoCard = game.getImage("c_"+ data.trunfo.name +"_of_"+ data.trunfo.typeName);

	var middle = {x:450, y:390};
	isTime = false;
	timer = 0;

	pivot = [
	{card: {x: middle.x - cardW/2 , y: middle.y + 30}, playCard:{x:middle.x - cardW/2, y:1200 + cardH}, avatar: {x: middle.x - 50, y: middle.y + 280,w:100, h:100}},
	{card: {x: middle.x + 100 , y : middle.y - cardH/2}, playCard:{x:900, y: middle.y - cardH/2}, avatar: {x:middle.x + 340, y: middle.y - 50, w:100, h:100}},
	{card: {x: middle.x - cardW/2 , y:middle.y - cardH - 30},playCard:{x:middle.x - cardW/2, y:-cardH}, avatar: {x:middle.x - 50, y:middle.y - 380, w:100, h:100}},
	{card: {x: middle.x - cardW - 100, y:middle.y - cardH/2}, playCard:{x:-cardH, y: middle.y - cardH/2}, avatar: {x:middle.x - 440, y:middle.y - 50, w:100, h:100}},
	];

	//getplayer id
	for(var i = 0; i < data.players.length; i++){
		if(data.players[i] == client.getID())
			mPlayer = i;
	}
	//fill players names
	var p = 0;
	for(var i = mPlayer; i < 4; i++ ){
		players.push(new Player(i,client.getPlayer(data.players[i]),pivot[p]));
		p++;
	}
	for(var i = 0; i < mPlayer; i++ ){
		players.push(new Player(i, client.getPlayer(data.players[i]), pivot[p]));
		p++;
	}

	//set up player cards
	for(var i = 0 ; i < data.array.length; i++){
		var c = data.array[i];
		var index = i;
		players[0].cards.push(new Card(c.name, c.type, "c_"+c.name +"_of_"+c.typeName));	
	}
	var offX = 20;
	var offY = 800;

	for(var i = 0; i < 10; i++){
		cardPosition.push({x: offX, y: offY});
		offX += cardW + 28;
		if(i == 4){
			offX = 20;
			offY+= cardH + 20;
		}
	}
	teams = data.teams;

	client.emit("ready",{});
	game.update = update;

	console.log(players);
	state = STATE.GAME;
}	





function update(){

	game.drawRect(0,0, game.width, game.height, "#2E7D32");

	game.drawImage(trunfoCard, 10, 10, cardW, cardH);
	
	
	game.drawGUILabel(game.width - 220, 10, 220, 50, (mPlayer == 0 || mPlayer==1 ? "WE":"THEY"), "white", theme.fontmedium, "center", "middle");
	game.drawImage(game.getImage("points"), game.width - 220, 80, 200, 100);
	game.drawGUILabel(game.width - 220, 210, 220, 50, (mPlayer == 0 || mPlayer==1 ? "THEY":"WE"), "white", theme.fontmedium, "center", "middle");

	for(var i = 0; i < teams.length; i++){
		var x = game.width - 187;
		for(var j = 0; j < teams[i].points; j++){
			game.drawGUICircle(x + 40*j, 80 + 90*i, 20, "yellow");
		}
	}
	//pivots
	for(var i = 0; i< 4; i++){
		if(currentPlayer == players[i].id){
			if(isTime){
				var newTime = Math.round((maxTime - ((new Date()).getTime() - timer)) / 1000);
				game.drawGUILabel(players[i].pivot.avatar.x,players[i].pivot.avatar.y - 50, players[i].pivot.avatar.w, 30, newTime > 0 ? newTime : 0, newTime>2 ? "yellow": "#BB0000", theme.fontmedium, "center", "middle");
			}
			game.drawRect(players[i].pivot.avatar.x - 10, players[i].pivot.avatar.y-10, players[i].pivot.avatar.w + 20, players[i].pivot.avatar.w + 20, "yellow");
		}else{
			game.drawRect(players[i].pivot.avatar.x - 5, players[i].pivot.avatar.y-5, players[i].pivot.avatar.w + 10, players[i].pivot.avatar.w + 10, "white");
		}
		game.drawImage(players[i].info != null ? players[i].info.img : game.getImage("bot"), players[i].pivot.avatar.x, players[i].pivot.avatar.y, players[i].pivot.avatar.w, players[i].pivot.avatar.h);
	}
	if(state == STATE.GAME){
		for(var i = 0; i < 10; i++){
			if(highlight[i]){
				game.drawRect(cardPosition[i].x-5, cardPosition[i].y-5,  cardW + 10, cardH + 10, "yellow");
			}
			if(!players[0].cards[i].played && game.ImageButton(cardPosition[i].x, cardPosition[i].y,  cardW, cardH, "", "", game.getImage(players[0].cards[i].img))){
				console.log("CLICK "+ i);
				playCard(i);
			}
		}
	}

	
	for(var i  = 0; i < cardEffects.length; i++){
		cardEffects[i].update();
	}
	if(state == STATE.ENDGAME){
		var endPivot = {x:450, y:600};
		var endBallW = 200;

		game.drawRect(0,0, game.width, game.height, "rgba(0,0,0,0.9)");
		var endfont = "60px sueca";
		for(var i = 0; i <= 1; i++){
			var p1 = getPlayer(i);
			var p2 = getPlayer(i+2);

			game.drawGUILabel(endPivot.x - endBallW - 50, endPivot.y - endBallW - 140, (endBallW+50)*2, 100, p1.id == mPlayer || p2.id==mPlayer? "WE" : "THEY", "white", endfont, "center", "middle");
			
			game.drawGUICircle(endPivot.x - endBallW - 120 - 10, endPivot.y - endBallW * 2 - 10, endBallW + 20, p1.ready == true ? "green" : p1.ready == false? "red" : "white");
			game.drawGUICircleImage(p1.info != null ? p1.info.img : game.getImage("bot"),endPivot.x - endBallW - 120, endPivot.y - endBallW * 2, endBallW, endBallW);

			game.drawGUICircle(endPivot.x + 120 - 10, endPivot.y - endBallW * 2 - 10, endBallW + 20, p2.ready == true ? "green" : p2.ready == false? "red" : "white");
			game.drawGUICircleImage(p2.info != null ? p2.info.img : game.getImage("bot"),endPivot.x + 120, endPivot.y - endBallW * 2, endBallW, endBallW);

			var y1 = endPivot.y - endBallW + 30;
			var y2 = endPivot.y - endBallW * 3 + 50;

			game.drawGUILabel(endPivot.x - endBallW - 50, i == 0 ?  y1: y2 , (endBallW+50)*2, 100, teams[i].roundPoints, "#64DD17", endfont, "center", "middle");
			game.drawGUILabel(endPivot.x - endBallW - 50, i == 0 ? y2 : y1 , (endBallW+50)*2, 100, teams[i].win + " / " + teams[i].points, "white", endfont, "center", "middle");
			
			endPivot.y += 500;
		}

		//if(game.Button(450 - 150, 1150, 300, 100, "Play Again", "white", "blue","40px Arial", "center", "middle")){
			if(game.ImageButton(200, 1100, 150, 150, "", "", game.getImage("btExit"))){
				game.playSound("beep");
				client.exitRoom();
			}

			if(game.ImageButton(550, 1100, 150, 150, "", "", game.getImage("btPlay"))){
				game.playSound("beep");
				client.emit("ready",{});
			}
		//game.drawGUICircle(endMiddle.x, endMiddle.y, endBallW, "white");

	}
	//game.drawGUIText(10, 10, game.getFPS());

	if(notification != null)
		notification.draw();

}
function teste(){
	console.log("1");
	client.emit("keyPressed");
}
function teste2(){
	console.log("2");
	client.emit("keyPressed2");
}

///Server Responses
function onDisconnect(data){
	notification = new Notification(client.getPlayer(data.id).username + " has disconnected!");
}
function onTurn(data){
	//TO DO
	currentPlayer = data.player;
	isTime = true;
	maxTime = data.time;
	timer = (new Date()).getTime();
	if(currentPlayer == mPlayer){
		canPlay = true;

		for(var i =0 ; i < players[0].cards.length; i++){
			if(isValidCard(i) && !players[0].cards[i].played){
				highlight[i] = true;
			}
		}
	}
}

function onPlay(data){

	var p = getPlayer(data.player);
	if(p!=null){
		isTime = false;
		game.playSound("card", 0.1);
		playedCards.push(new Card(data.card.name, data.card.type, null));

		if(data.player == mPlayer){
			for(var i = 0; i < 10; i++){
				highlight[i] = false;
			}
			p.cards[data.cardID].played = true;
			cardEffects.push(new CardEffect(game.getImage("c_"+data.card.name + "_of_" + data.card.typeName), cardPosition[data.cardID].x, cardPosition[data.cardID].y,
				p.pivot.card.x, p.pivot.card.y));
		}else{
			cardEffects.push(new CardEffect(game.getImage("c_"+data.card.name + "_of_" + data.card.typeName), p.pivot.playCard.x, p.pivot.playCard.y,
				p.pivot.card.x, p.pivot.card.y));
		}
	}
}

function onEndTurn(data){
	currentPlayer = 0;
	canPlay = false;
	playedCards = [];
	var w = getPlayer(data.winner);
	currentPlayer = -1;
	round++;
	setTimeout(function(){
		for(i = 0; i < cardEffects.length; i++){
			cardEffects[i].reset(w.pivot.playCard.x, w.pivot.playCard.y);
		}
		game.playSound("card2", 0.2);
	}, 2000);

	setTimeout(function(){
		cardEffects = [];
		if(round< maxRound)client.emit("ready",{});
	}, 3000);
}

function onEndGame(data){
	//TO DO
	console.log(data);
	setTimeout( function(){
		
		if(data.teams[0].roundPoints > data.teams[1].roundPoints){
			teamWinner = 0;
		}else if(data.teams[0].roundPoints< data.teams[1].roundPoints){
			teamWinner = 1;
		}else{
			teamWinner = -1;
		}

		teams = data.teams;

		state = STATE.ENDGAME;
	}, 2000);
}

function onContinue(data){
	//TO DO

	var p = getPlayer(data.player);
	p.ready = data.state;
}

//classes
function Play(player, card){
	this.player = player;
	this.card = card;
}

function Card(name, type, img){
	this.name = name;
	this.type = type;
	this.img = img;
	this.played = false;
}

function Player(id, info, pivot){
	this.id = id;
	this.info = info;
	this.pivot = pivot;
	this.cards = [];
	this.ready = undefined;
}

function CardEffect(img, sx, sy, fx, fy){
	this.x = sx;
	this.y = sy;
	this.sx = sx;
	this.sy = sy;
	this.fx = fx;
	this.fy = fy;
	this.img = img;
	this.time = 0;
	this.finished = false;

	this.update = function(){
		if(!this.finished){
			this.time += game.deltaTime;
			this.x = Math.lerp(this.sx, this.fx, this.time * 3);  
			this.y = Math.lerp(this.sy, this.fy, this.time * 3);

			if(Math.distance(this.x, this.y, this.fx, this.fy) < 1){
				this.x = this.fx;
				this.y = this.fy;
				this.finished = true;
			}
		}

		game.drawImage(this.img , this.x, this.y, cardW, cardH);
	}

	this.reset = function(x, y){
		this.fx = x;
		this.fy = y;
		this.sx = this.x;
		this.sy = this.y;
		this.finished = false;
		this.time = 0;
	}
}

function Notification(msg){
	
	this.w = 600;
	this.h = 200;
	this.x = game.width - this.w - 10;
	this.y = game.height + this.h + 1;
	this.wY = game.height - this.h - 10;
	this.msg = msg;
	this.currentTime = 0;

	this.draw = function(){
		this.currentTime += game.deltaTime;
		game.drawRect(this.x-2, this.y-2, this.w+1, this.h+1, "#CCCCCC");
		game.drawRect(this.x, this.y, this.w, this.h, "#FFFFFF");
		game.drawGUILabel(this.x, this.y, this.w, this.h, this.msg, "#444444", theme.fontmedium, "center", "middle");

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
	notification = null;
}