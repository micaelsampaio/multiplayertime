var client;

setResize(document.getElementById("gamecontainer"));

//load images
var sources = {};

sources["c_2_of_hearts"]="/games/sueca/images/2_of_hearts.png";
sources["c_2_of_spades"]="/games/sueca/images/2_of_spades.png";
sources["c_2_of_diamonds"]="/games/sueca/images/2_of_diamonds.png";
sources["c_2_of_clubs"]="/games/sueca/images/2_of_clubs.png";
sources["c_3_of_hearts"]="/games/sueca/images/3_of_hearts.png";
sources["c_3_of_spades"]="/games/sueca/images/3_of_spades.png";
sources["c_3_of_diamonds"]="/games/sueca/images/3_of_diamonds.png";
sources["c_3_of_clubs"]="/games/sueca/images/3_of_clubs.png";
sources["c_4_of_hearts"]="/games/sueca/images/4_of_hearts.png";
sources["c_4_of_spades"]="/games/sueca/images/4_of_spades.png";
sources["c_4_of_diamonds"]="/games/sueca/images/4_of_diamonds.png";
sources["c_4_of_clubs"]="/games/sueca/images/4_of_clubs.png";
sources["c_5_of_hearts"]="/games/sueca/images/5_of_hearts.png";
sources["c_5_of_spades"]="/games/sueca/images/5_of_spades.png";
sources["c_5_of_diamonds"]="/games/sueca/images/5_of_diamonds.png";
sources["c_5_of_clubs"]="/games/sueca/images/5_of_clubs.png";
sources["c_6_of_hearts"]="/games/sueca/images/6_of_hearts.png";
sources["c_6_of_spades"]="/games/sueca/images/6_of_spades.png";
sources["c_6_of_diamonds"]="/games/sueca/images/6_of_diamonds.png";
sources["c_6_of_clubs"]="/games/sueca/images/6_of_clubs.png";
sources["c_queen_of_hearts"]="/games/sueca/images/queen_of_hearts.png";
sources["c_queen_of_spades"]="/games/sueca/images/queen_of_spades.png";
sources["c_queen_of_diamonds"]="/games/sueca/images/queen_of_diamonds.png";
sources["c_queen_of_clubs"]="/games/sueca/images/queen_of_clubs.png";
sources["c_jack_of_hearts"]="/games/sueca/images/jack_of_hearts.png";
sources["c_jack_of_spades"]="/games/sueca/images/jack_of_spades.png";
sources["c_jack_of_diamonds"]="/games/sueca/images/jack_of_diamonds.png";
sources["c_jack_of_clubs"]="/games/sueca/images/jack_of_clubs.png";
sources["c_king_of_hearts"]="/games/sueca/images/king_of_hearts.png";
sources["c_king_of_spades"]="/games/sueca/images/king_of_spades.png";
sources["c_king_of_diamonds"]="/games/sueca/images/king_of_diamonds.png";
sources["c_king_of_clubs"]="/games/sueca/images/king_of_clubs.png";
sources["c_7_of_hearts"]="/games/sueca/images/7_of_hearts.png";
sources["c_7_of_spades"]="/games/sueca/images/7_of_spades.png";
sources["c_7_of_diamonds"]="/games/sueca/images/7_of_diamonds.png";
sources["c_7_of_clubs"]="/games/sueca/images/7_of_clubs.png";
sources["c_ace_of_hearts"]="/games/sueca/images/ace_of_hearts.png";
sources["c_ace_of_spades"]="/games/sueca/images/ace_of_spades.png";
sources["c_ace_of_diamonds"]="/games/sueca/images/ace_of_diamonds.png";
sources["c_ace_of_clubs"]="/games/sueca/images/ace_of_clubs.png";

//ui menus
var loading = document.getElementById("loading");
var game = document.getElementById("game");
var menu = document.getElementById("menu");
var uiEndGame = document.querySelector("#endGame");

loading.style.display = "block";
menu.style.display = "none";
game.style.display = "none";
uiEndGame.style.display = "none";
//ui bt
var btContinue = document.getElementById("btContinue");
var btExit = document.getElementById("btExit");
//ui images
var loadedImages;

//ui
var c_users = [];
var gameCards = [];
var effectCards = [];
var teams = [{win: document.getElementById("team1Win"), points: document.getElementById("team1Points")}, 
{win: document.getElementById("team2Win"), points: document.getElementById("team2Points")}]
var pivot = [];
var trunfoCard = document.getElementById("card4");
var playerCards = [];

//
for(var i = 0; i < 4; i++){
	c_users[i] = document.getElementById("c_user"+i);
	gameCards[i] = document.getElementById("card"+i);
	effectCards[i] = document.getElementById("tempcard"+i);
	pivot[i] = document.getElementById("pivot"+i);
}

for(var i = 0; i < 10; i++){
	playerCards.push(document.getElementById("pcard"+i));
}

//game
var players = [];
var mPlayer;
var trunfo;
var round = 1;
var turn = 0;
var currentPlayer = 0;
var mPlayer = 0;
var trunfo;
var playedCards = [];
var canPlay = false;

//endGame
var teamWinner = document.getElementById("teamWinner");
var teamState = document.getElementById("teamState");

loadImages(sources, function(images){
	loadedImages = images;

	client = new client(getServer("sueca"), "gamecontainer");

	client.on("startGame", onStartGame);
	client.on("turn", onTurn);
	client.on("play", onPlay);
	client.on("endGame", onEndGame);
	client.on("continue", onContinue);
	client.on("endTurn", onEndTurn);


	//loading.style.display = "none";
	//menu.style.display = "blokc";
});

function getPlayer(id){
	for(var i = 0; i < players.length; i++){
		if(players[i].id == id)
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
	
	//console.log("Play card : " + currentPlayer +" "+ mPlayer +" "+ canPlay + " " + id);
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
			//canPlay = false;
			client.emit("playCard", {card: id});
			//console.log("JOGADA VALIDA " + id);
		}else{
			alert("Carta Inválida");
		}
	}
}

function continuePlay() {
	client.emit("ready",{});
}
/*
btContinue.addEventListener('touchend', function(event) {
	continuePlay();
}, false);*/

btContinue.addEventListener(eventClick, function(event) {
	continuePlay();
}, false);

/*btExit.addEventListener('touchend', function(event) {
	client.emit("exitRoom");
}, false);*/

btExit.addEventListener(eventClick, function(event) {
	client.emit("exitRoom");
}, false);

for(var i=0; i< 10; i++){
	/*playerCards[i].addEventListener('touchend', function(event, i) {
		return function() { playCard(i); }
	}(false, i));*/

	playerCards[i].addEventListener(eventClick, function(event, i) {
		return function() { playCard(i); }
	}(false, i));
}
/// SERVER Responses
function onStartGame(data){
	client.hideAll();
	//console.log(data);
	players = [];
	
	trunfo = data.trunfo.type;
	trunfoCard.src = loadedImages["c_"+ data.trunfo.name +"_of_"+ data.trunfo.typeName].src;

	//getplayer id
	for(var i = 0; i < data.players.length; i++){
		if(data.players[i] == client.getID())
			mPlayer = i;
	}
	//fill players names
	var p = 0;
	for(var i = mPlayer; i < 4; i++ ){
		players.push(new Player(i, document.getElementById("u"+p), gameCards[p], effectCards[p], pivot[p]));
		document.getElementById("u"+p).innerHTML = (i < data.players.length ? data.players[i] : "bot");
		p++;
	}
	for(var i = 0; i < mPlayer; i++ ){
		players.push(new Player(i, document.getElementById("u"+p), gameCards[p], effectCards[p], pivot[p]));
		document.getElementById("u"+p).innerHTML = (i < data.players.length ? data.players[i] : "bot");
		p++;
	}

	//set up player cards
	for(var i = 0 ; i < data.array.length; i++){
		var c = data.array[i];
		var index = i;
		players[0].cards.push(new Card(c.name, c.type, "c_"+c.name +"_of_"+c.typeName));
		playerCards[i].src = loadedImages[players[0].cards[i].img].src;

		//playerCards[i].addEventListener('click', function(i) {
		//		return function() { playCard(i); }
		//	}(i));

		playerCards[i].style.display = "block";

		client.emit("ready",{});
	}

	for(var i = 0; i < 4; i++){
		gameCards[i].style.display = "none";
	};

	teams[0].win.innerHTML = data.teams[0].win;
	teams[0].points.innerHTML = data.teams[0].points;
	teams[1].win.innerHTML = data.teams[1].win;
	teams[1].points.innerHTML = data.teams[1].points;

	/*setCardPosition("card effect", effectCards[0], pivot[data.winner], -360);
	setCardPosition("card effect", effectCards[1], pivot[data.winner], -360);
	setCardPosition("card effect", effectCards[2], pivot[data.winner], -360);
	setCardPosition("card effect", effectCards[3], pivot[data.winner], -360);*/
	
	loading.style.display = "none";
	uiEndGame.style.display = "none";
	game.style.display = "block";
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
function onTurn(data){
	//TO DO
	currentPlayer = data.player;

	//console.log("NEXT PLAYER " + currentPlayer + " " + mPlayer);
	if(currentPlayer == mPlayer){
		//console.log("CAN PLAY ");
		canPlay = true;

		for(var i =0 ; i < players[0].cards.length; i++){
			if(isValidCard(i)){
				playerCards[i].className="card highlight";
			}
		}
	}

	for(var i = 0; i < players.length; i++){
		if(currentPlayer == players[i].id){
			players[i].username.className = "username currentPlayer";
		}else{
			players[i].username.className = "username";
		}				
	}
}

function onPlay(data){
	//TO DO
	console.log(data);
	var p = getPlayer(data.player);

	playedCards.push(new Card(data.card.name, data.card.type, null));

	p.card.src = loadedImages["c_"+data.card.name + "_of_" + data.card.typeName].src;
	p.card.style.display = "none";

	if(data.player == mPlayer){
		p.card.src = "";

		setCardPosition("card", p.effectCard, playerCards[data.cardID], 0);
		
		setTimeout(function(){
			setCardPosition("card effect", p.effectCard, p.card, -360)
		}, 50);

		p.effectCard.src = loadedImages["c_"+data.card.name + "_of_" + data.card.typeName].src;

		players[0].cards[data.cardID].played = true;
		playerCards[data.cardID].style.display = "none";

		for(var i =0 ; i < players[0].cards.length; i++){
			playerCards[i].className="card";
		}

	}else{
		console.log("-------------");
		setCardPosition("card", p.effectCard, p.pivot, 0);
		
		setTimeout(function(){
			setCardPosition("card effect", p.effectCard, p.card, -360)
		}, 50);

		p.effectCard.src = loadedImages["c_"+data.card.name + "_of_" + data.card.typeName].src;
	}
}

function onEndTurn(data){
	currentPlayer = 0;
	canPlay = false;
	playedCards = [];
	var w = getPlayer(data.winner);
	var round = data.round;
	console.log(w);
	console.log(w)
	setTimeout(function(){
		setCardPosition("card effect", effectCards[0], w.pivot, -360);
		setCardPosition("card effect", effectCards[1], w.pivot, -360);
		setCardPosition("card effect", effectCards[2], w.pivot, -360);
		setCardPosition("card effect", effectCards[3], w.pivot, -360);
	}, 2000);

	setTimeout(function(){
		for(var i = 0; i < 4; i++){
			gameCards[i].style.display = "none";
		};

		setCardPosition("card", effectCards[0], w.pivot, -360);
		setCardPosition("card", effectCards[1], w.pivot, -360);
		setCardPosition("card", effectCards[2], w.pivot, -360);
		setCardPosition("card", effectCards[3], w.pivot, -360);

		if(round<10)client.emit("ready",{});
	}, 3000);
}

function onEndGame(data){
	//TO DO
	console.log(data);
	setTimeout( function(){
		game.style.display = "none";
		uiEndGame.style.display = "block";

		if(data.teams[0].roundPoints > data.teams[1].roundPoints){
			teamWinner.innerHTML = "Blue Team";
			teamState.innerHTML="WIN";
		}else if(data.teams[0].roundPoints< data.teams[1].roundPoints){
			teamWinner.innerHTML = "Red Team";
			teamState.innerHTML="WIN";
		}else{
			teamWinner.innerHTML = "Blue and Red Team";
			teamState.innerHTML="DRAW";
		}

		document.getElementById("team1Result").innerHTML = data.teams[0].roundPoints;
		document.getElementById("team2Result").innerHTML = data.teams[1].roundPoints;

		for(var i = 0; i < data.players.length; i++){
			console.log(c_users[i]);
			if(data.players[i]== null){
				c_users[i].className = "player bot";
			}else{
				c_users[i].className = "player";
			}
		}
	}, 2000);
}

function onContinue(data){
	//TO DO
	if(data.state){
		c_users[data.player].className = "player play";	
	}else{
		c_users[data.player].className = "player noplay";
	}
	
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

function Player(id, username, card, effectCard, pivot){
	this.id = id;
	this.username = username;
	this.card = card;
	this.effectCard = effectCard;
	this.pivot = pivot;
	this.cards = [];
}
function setCardPosition(cl, e1, e2, rot){
	e1.className = cl;
	e1.style.top = getStyle(e2, "top");
	e1.style.left = getStyle(e2, "left");
	e1.style.transform = "rotate("+rot+"deg)";
}

function getStyle(el, styleProp) {
	var value, defaultView = (el.ownerDocument || document).defaultView;

	if (defaultView && defaultView.getComputedStyle) {
		styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
		return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
	} else if (el.currentStyle) { 
		styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
			return letter.toUpperCase();
		});
		value = el.currentStyle[styleProp];
		if (/^\d+(em|pt|%|ex)?$/i.test(value)) { 
			return (function(value) {
				var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
				el.runtimeStyle.left = el.currentStyle.left;
				el.style.left = value || 0;
				value = el.style.pixelLeft + "px";
				el.style.left = oldLeft;
				el.runtimeStyle.left = oldRsLeft;
				return value;
			})(value);
		}
		return value;
	}
}