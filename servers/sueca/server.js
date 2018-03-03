"use strict";

var express = require('express');
var colors = require('colors/safe')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {transports: ['websocket']});

var RoomsManager = require('../rooms');
var Classes = require('./classes');

http.listen(8000);

console.log(colors.green(`
	+-----------------------------------------------------+
	|                                                     |
	|                   SUECA                             |
	|                                                     |
	|       Server at:   http://localhost:8000            |
	|                                                     |
	+-----------------------------------------------------+
`));

///Load game info
var cards=[];
var points = [0, 0, 0, 0, 0, 2, 3, 4, 10, 11];
var names = ["2", "3", "4", "5", "6","queen", "jack", "king","7", "ace"];
var types = ["hearts", "spades","diamonds","clubs"];

for(var i = 0; i < names.length; i++){
	for(var j = 0; j < types.length; j++){
		cards.push(new Classes.Card(i, names[i], j, "c_"+names[i]+"_of_"+types[j], points[i]));
	}
}

var t = "Loaded Cards\n";

var manager = new RoomsManager(io, Game, 2, 4);

function Game(room){
	var room = room;

	var id = id;
	var players = [];
	var gameCards = [];
	var turn = 0;
	var round = 0;
	var startPlayer = 0;
	var currentPlayer = 0;
	var playedCards = [];
	var team1Cards = [];
	var team2Cards = [];
	var trunfo;
	var changeTurn = false;
	var readyPlayers = [];

	var team1Points = 0;
	var team2Points = 0;
	var team1Wins = 0;
	var team2Wins = 0;

	var maxRound = 10;

	var STATE = {NONE: -1, WAITING:0, PLAYING:1, ENDTURN:2, ENDGAME:3};
	var state = STATE.NONE; 

	var timer = null;
	
	function getPlayer(id){
		for(var i= 0; i < players.length; i++){
			if(players[i]!=null && players[i]==id){
				return players[i];
			}
		}
	}
	function getPlayerIndex(id){
		for(var i= 0; i < players.length; i++){
			if(players[i]!=null && players[i]==id){
				return i;
			}
		}
	}

	this.startGame = function(){
		if(state == STATE.NONE){
			var startTime = (new Date()).getTime();
			//restart variables
			state = STATE.WAITING;

			readyPlayers = [];
			gameCards = [];
			turn = 0;
			round = 0;
			startPlayer = 0;
			currentPlayer = 0;
			players = [];
			playedCards = [];
			team1Cards = [];
			team2Cards = [];
			if(timer != null)
				clearTimeout(timer);
			timer = null;

			if(team1Points == 4 || team2Points == 4){
				team1Points = 0;
				team2Points = 0;
			}

			changeTurn = false;
			//Start server game variables
			var tempCards = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
			21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39];

			shuffle(tempCards);
			shuffle(tempCards);
			shuffle(tempCards);
			shuffle(tempCards);

			trunfo = cards[tempCards[startPlayer*10]];

			//set the player info and socket functions
			for(var i = 0; i < 4; i++){
				var c = [];
				var sendCards = [];
				for(var j = 0; j < 10; j++){
					var n = tempCards[i*10 + j];
					c.push(new Classes.PlayerCard(n));
				}
				//organize cards
				for(var j = 0; j < 10; j++){
					for(var k = 0; k < 10; k++){
						var card1 = cards[c[j].index];
						var card2 = cards[c[k].index];

						if(card1.type < card2.type || (card1.type == card2.type && card1.rank > card2.rank)){
							var aux = c[j];
							c[j] = c[k];
							c[k] = aux;
						}
					}
				}
				//set player cards
				for(var j = 0; j < 10; j++){
					var n = c[j].index;
					sendCards.push({name : cards[n].name, type : cards[n].type, typeName: types[cards[n].type]});
				}

				gameCards.push(c);
				//send player info
				if(i < room.getPlayers().length){
					var player = room.getPlayer(i); 
					
					player.removeAllListeners("ready");
					player.removeAllListeners("playCard");

					player.on("ready", this.onReady);
					player.on("playCard", this.onPlay);

					player.emit("startGame", {array: sendCards, players: room.getPlayersId(), trunfo : {name : trunfo.name, type : trunfo.type, typeName: types[trunfo.type]},
						teams: [{win: team1Wins, points: team1Points}, {win: team2Wins, points: team2Points}]});

					players.push(player.player.id);
				}else{
					players.push(null);
				}
			}

			nextPlayer();
			console.log("created at: " + ((new Date()).getTime()-startTime)+ "ms");
		}
	}

	///GAME
	function nextPlayer (){
		room.emit("turn", {player : currentPlayer, time: 10000});
		timer = setTimeout(playerTimeOut, 12000);
	}
	function playerTimeOut(){
		clearTimeout(timer);
		console.log("TimeOUT " + currentPlayer);
		playBot();
	}
	//play card as server
	function playCard(player, card){
		if(state == STATE.PLAYING){
			console.log(player + " " +  card);
			var c = cards[gameCards[player][card].index];

			//TO DO VALIDATION
			/*if(card >= 0 && card <=9){
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
			}*/
			//



			console.log("PLAY CARD " + player + " card: " + card + " " + c.name+ " " + types[c.type]); 
			gameCards[player][card].played = true;
			playedCards.push(new Classes.PlayedCard(player, c));
			room.emit("play", {player: player, card : {name : c.name, type : c.type, typeName : types[c.type]}, cardID : card});
			step();
		}
	}
	///end of a play
	function step(){
		if(round<maxRound){
			turn++;
			currentPlayer++;
			if(currentPlayer>=4){
				currentPlayer=0;
			}

			if(turn >= 4){
				endTurn();
			}else if(players[currentPlayer] == null){
				console.log("bot");
				playBot();
			}else{
				console.log("currentPlayer -> " + currentPlayer);
				nextPlayer(); 
			}
		}
	}
	//play as bot
	function playBot(){
		clearTimeout(timer);
		var botPlayCard = null;
		var playIndex = -1;
		var tempCards = gameCards[currentPlayer];
		if(playedCards.length == 0){

			for(var i = 0; i < tempCards.length; i++){
				var card = cards[tempCards[i].index];
				if((!tempCards[i].played && botPlayCard == null) || (botPlayCard!= null && !tempCards[i].played && botPlayCard.rank < card.rank)){
					botPlayCard = card;
					playIndex = i;
				}
			}

			console.log("BOT 1 -> " + playIndex);

		}else{
			var tempType = playedCards[0].card.type;
			console.log("type: " + tempType);

			for(var i = 0; i < tempCards.length; i++){
				var card = cards[tempCards[i].index];
				if((!tempCards[i].played && botPlayCard == null && card.type == tempType) || (botPlayCard!= null && !tempCards[i].played && botPlayCard.rank < card.rank && card.type == tempType)){
					botPlayCard = card;
					playIndex = i;
				}
			}

			if(botPlayCard == null){
				for(var i = 0; i < tempCards.length; i++){
					var card = cards[tempCards[i].index];
					if((!tempCards[i].played && botPlayCard == null && card.type == trunfo.type) || (botPlayCard!= null && !tempCards[i].played && botPlayCard.rank < card.rank && card.type == trunfo.type)){
						botPlayCard = card;
						playIndex = i;
					}
				}
			}

			if(botPlayCard == null){
				for(var i = 0; i < tempCards.length; i++){
					var card = cards[tempCards[i].index];
					if(!tempCards[i].played){
						botPlayCard = card;
						playIndex = i;
					}
				}
			}

			console.log("BOT -> " + playIndex);

		}

		playCard(currentPlayer, playIndex);
	}
	function nextTurn(){
		if(changeTurn){
			state = STATE.PLAYING;
			changeTurn = false;
			nextPlayer();

			if(players[currentPlayer] == null && turn <maxRound){
				playBot();
			}
		}
	}

	function endTurn(){
		console.log(playedCards);
		var winner = playedCards[0].player;
		var winnerCard = playedCards[0].card;

		for(var i = 1; i < playedCards.length; i++){
			if(winnerCard.type == playedCards[i].card.type && playedCards[i].card.rank > winnerCard.rank){
				console.log(playedCards[i].card.rank + " > " + winnerCard.rank);
				winner = playedCards[i].player;
				winnerCard = playedCards[i].card;
			}else if(winnerCard.type != playedCards[i].card.type && playedCards[i].card.type == trunfo.type){
				console.log(winnerCard.type +" != " + playedCards[i].card.type + " trunfo " + trunfo.type);
				winner = playedCards[i].player;
				winnerCard = playedCards[i].card;
			}
		}

		for(var i = 0; i < playedCards.length; i++){
			if(winner == 0 || winner== 2){
				team1Cards.push(playedCards[i]);
			}else{
				team2Cards.push(playedCards[i]);
			}
		}
		console.log("WINNER " + winner);
		round++;
		playedCards = [];
		readyPlayers = [];
		///TODO
		turn = 0;
		currentPlayer = winner;
		changeTurn = true;
		state = STATE.ENDTURN;

		room.emit("endTurn", {round:round, winner: winner});

		if(round == maxRound){//if(round == 10){
			console.log("END END");
			changeTurn = false; 

			var points1 = 0;
			var points2 = 0;

			for(var i = 0; i < team1Cards.length; i++){
				points1 += team1Cards[i].card.points;
			}
			for(var i = 0; i < team2Cards.length; i++){
				points2 += team2Cards[i].card.points;
			}
			console.log("points " + points1 + " - " + points2);
			state = STATE.ENDGAME;
			readyPlayers = [];
			var diff = 120 - Math.abs(points1 > points2);
			if(points1 > points2){
				team1Points = points2 == 0 ? team1Points + 4: points2 >  30 ? team1Points +1: team1Points+ 2;
				if(team1Points>=4){
					team1Points = 4;
					team1Wins ++; 
				}
			}else if(points2 > points1){
				team2Points = points1 == 0 ? team2Points + 4: points1 >  30 ? team2Points +1: team2Points+ 2;
				if(team2Points>=4){
					team2Points = 4;
					team2Wins ++; 
				}
			}else{

			}

			room.emit("endGame", {teams:[{points: team1Points, roundPoints:points1, win: team1Wins },
				{points: team2Points, roundPoints:points2, win: team2Wins}], 
				team1PlayedCards: team1Cards, team2PlayedCards: team2Cards,
				players: players});
		}

		console.log("Ronda " +round);
		
	}

	//play card client
	this.onDisconnect = function(id){
		console.log("DISCONNECT " + id);
		var index = getPlayerIndex(id);
		if(index != -1){
			clearTimeout(timer);
			room.emit("removeGame");
			
		}
		
	}

	function checkReady(){
		console.log(room.id);
		console.log("READY " + readyPlayers.length +" >= "+  room.getPlayers().length);
		
		if(readyPlayers.length >= room.getPlayers().length && state == STATE.WAITING){
			console.log("StartPlay");
			state = STATE.PLAYING;
		}
		if(readyPlayers.length >= room.getPlayers().length && state == STATE.ENDGAME){
			state = STATE.NONE;
			room.game.startGame();
		}
		if(readyPlayers.length >= room.getPlayers().length && state == STATE.ENDTURN){
			nextTurn();
		}
	}
	this.onReady = function(data){
		var index = room.getPlayerIndex(this);

		if(index!= -1  && state == STATE.WAITING && readyPlayers.indexOf(index)==-1){
			readyPlayers.push(index);
			checkReady();
		}
		if(index!= -1  && state == STATE.ENDGAME && readyPlayers.indexOf(index)==-1){
			readyPlayers.push(index);
			console.log("Continue " + index);
			room.emit("continue", {player: index, state: true});
			checkReady();
		}
		if(index!= -1  && state == STATE.ENDTURN && readyPlayers.indexOf(index)==-1){
			readyPlayers.push(index);
			checkReady();
		}
	}
	function ola(){
		console.log("OLA");
	}

	function checkRoom(name){
		console.log(name + " " + room.id);
	}
	this.onPlay = function(data){
		console.log("Play " + STATE.PLAYING + " " + state);
		var index = getPlayerIndex(this.player.id);
		if(currentPlayer == index){ 
			console.log("PLAY");
			clearTimeout(timer);
			playCard(index, data.card);
		}
	}

};

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	while (0 !== currentIndex) {

		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

//Classes
