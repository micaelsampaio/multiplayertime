"use strict";

module.exports.Player = function (socket, x,y, w, h,minY, maxY, hp, speed){
	this.socket = socket;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.hp = hp;
	this.maxHp = hp;
	this.minY = minY;
	this.maxY = maxY;
	this.bullets = [];
	this.action = "idle";
	this.goX = x;
	this.goY = y;
	this.speed = speed;

	this.update = function(deltaTime){
		
		if(this.action == "idle"){
			
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
	}

}

module.exports.Bullet = function (id, x, y, w, h, speed){
	this.id = id;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.speed = speed;

	this.update = function(deltaTime){
		this.y += this.speed * deltaTime;
	}
	this.hit = function(target){
		if(target == undefined){
			return false;
		}
		return this.x <= target.x + target.width && this.x + this.width >= target.x 
			&& this.y <= target.y + target.height && this.y + this.height >= target.y
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