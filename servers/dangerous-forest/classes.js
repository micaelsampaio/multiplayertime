"use strict";

module.exports.Block = function(id, x, y, w, h){
	this.id = id;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.speed = 200;
	

	this.update = function(deltaTime){

		this.y -= this.speed * deltaTime;

		return this.y + this.height > 0;
	}

	this.getUpdateInfo = function(serverTime){
		return {id: this.id, x: this.x, y: this.y, t: serverTime};
	}
	
}

module.exports.Player = function(socket, x, y, w, h, sprite, limits){
	this.socket = socket;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.sprite = sprite;
	this.alive = true;
	this.dead = false;
	this.action = "idle";
	this.inputs = [];
	this.speed = 250;
	this.goX = this.x;
	this.goY = this.y;
	this.coin = 0;
	this.hp = 2;
	this.points = 0;
	this.limits = limits;

	this.update = function(deltaTime){
		if(this.alive){
			if(this.inputs.length > 0){
				var data = this.inputs[0];
				
				if(data.x < this.limits.left){
					data.x = this.limits.left;
				}
				if(data.x > this.limits.right){
					data.x = this.limits.right;
				}
				if(data.y > this.limits.bottom){
					data.y = this.limits.bottom;
				}
				if(data.y < this.limits.top){
					data.y = this.limits.top;
				}


				this.goX = data.x;
				this.goY = data.y;
				this.action = "run";
				this.inputs.splice(0, 1);
			}

			if(this.action == "run"){
				var data = distanceAndAngleBetweenTwoPoints(this.x, this.y, this.goX, this.goY);			
				if(data.distance > 5){
					var toMouseVector = new Vector(this.speed, data.angle);

					this.x += (toMouseVector.magnitudeX * deltaTime);
					this.y += (toMouseVector.magnitudeY * deltaTime);
				}else{
					this.x = this.goX;
					this.y = this.goY;
					this.action = "idle";
				}
			}

		}else if(!this.dead){
			this.y -= deltaTime * 200;
			if(this.y + this.height< 0){
				this.dead = true;
			}
		}

	}

	this.addInput = function(input){
		this.inputs.push(input);
	}
	this.hit = function(points){
		this.hp --;

		if(this.hp <= 0){
			this.points = Math.ceil(points);
			this.hp = 0;
			this.alive = false;
		}
	}
	this.addHP = function(){
		this.hp = this.hp<2 ? this.hp+1: this.hp;
	}
	this.addCoin = function(){
		this.coin++;
	}
	this.getUpdateInfo = function(serverTime){
		return {x: this.x, y: this.y, t: serverTime, action: this.action, dead: this.dead,
			alive: this.alive, coin: this.coin, hp: this.hp}
		}
	}
	
	function distanceAndAngleBetweenTwoPoints(x1, y1, x2, y2) {
		var x = x2 - (x1),
		y = y2 - (y1);

		return {
			distance: Math.sqrt(x * x + y * y),
			angle: Math.atan2(y, x) * 180 / Math.PI
		}
	}

	function Vector(magnitude, angle) {
		var angleRadians = (angle * Math.PI) / 180;

		this.magnitudeX = magnitude * Math.cos(angleRadians);
		this.magnitudeY = magnitude * Math.sin(angleRadians);
	}