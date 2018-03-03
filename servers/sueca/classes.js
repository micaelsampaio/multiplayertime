"use strict";

module.exports.Card = function (rank, name, type, img, points){
	this.rank = rank;
	this.name = name;
	this.type = type;
	this.points = points;
};
module.exports.PlayerCard = function(index){
	this.index = index;
	this.played = false;
}
module.exports.PlayedCard =function(player, card){
	this.player = player;
	this.card = card;
}
module.exports.Player = function (socket, name){
	this.socket = socket;
	this.name = name;
	this.state = 0;
}