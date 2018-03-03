"use strict";

module.exports.Block = function(x, y, w, h, type){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.type = type;
}

module.exports.Player = function(socket, x, y, w, h, sprite, hp){
	this.socket = socket;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.block = 0;
	this.sprite = sprite;
	this.points = 0;
	this.hp = hp;
	this.alive = true;
	this.dead = false;
}