"use strict";

module.exports.Block = function(id, type, x, y, w, h){
	this.id = id;
	this.type = type;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

module.exports.Player = function(socket, x, y, w, h, sprite, hp, block, pos){
	this.socket = socket;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.block = block;
	this.sprite = sprite;
	this.points = 0;
	this.hp = hp;
	this.alive = true;
	this.pos = pos;
	this.canPlay = true;
}

module.exports.Tower = function(y,type){
	this.x = x;
	this.type = type;
}