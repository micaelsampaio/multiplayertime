"use strict";

module.exports.Block = function(id, x, y, w, h){
	this.id = id;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

module.exports.Player = function(socket, x, y, w, h, sprite, limits, block){
	this.socket = socket;
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.sprite = sprite;
	this.block = block;
	this.points = 0;
	this.alive = true;
	this.dead = false;
	this.rotation = 0;
	this.limits =limits;
	this.grav = 0;
	this.gravSpeed = 300;
	this.speed = 100;
	this.maxJump = -150;

	this.jumping = 0;
	this.inputs = [];

	this.update = function(deltaTime){
		if(!this.dead){
			if(this.alive){
				if(this.inputs.length > 0){
					if(this.inputs[0] == "jump"){
						this.jump();
						this.inputs.splice(0,1);
					}
				}

				this.x+= deltaTime * this.speed;
				this.y+= this.grav * deltaTime;
				this.grav += deltaTime*this.gravSpeed;

				if(this.grav > 100){
					this.rotation = Math.min(75, this.rotation + deltaTime * 150);
				}else{
					this.rotation = Math.max(-45, this.rotation - deltaTime * 200);
				}
			}else{
				this.x+= deltaTime * this.speed;
				this.y+= this.grav * deltaTime;
				this.grav += deltaTime*this.gravSpeed;
				this.rotation = Math.min(180, this.rotation + deltaTime * 200);
				
				if(this.y > this.limits.maxY){
					this.dead = true;
					console.log("DEAD ");
				}
			}
		}

		if(this.y > this.limits.maxY){
			this.y = this.limits.maxY;
			this.grav = 0;
		}
		if(this.y < this.limits.minY){
			this.y = this.limits.minY;
		}
	}
	this.jump = function(){
		this.grav = this.maxJump;
		this.jumping ++;
	}
	this.die = function(){
		this.jump();
		this.alive = false;
	}
	this.addInput = function(input){
		this.inputs.push(input);
	}
}