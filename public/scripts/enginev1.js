window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame   || 
	window.mozRequestAnimationFrame      || 
	window.oRequestAnimationFrame        || 
	window.msRequestAnimationFrame       || 
	function(callback, element){
		window.setTimeout(function(){

			callback(+new Date);
		}, 1000 / 60);
	};
})();

function GameArea (id, w, h, resize) {
	var game = this;
	this.canvas = document.getElementById(id);
	//this.canvas.width = w ||  this.canvas.width;
	//this.canvas.height = h ||  this.canvas.height;
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.context = this.canvas.getContext("2d");
	this.offSetX = 0;
	this.offSetY = 0;
	this.update = null;

	this.clear = function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	function clear () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	this.start = function(update){
		this.update = update;
		Time.update();
		Time.clear();
		
		this.gameLoop();
	}

	this.gameLoop = function(){
		Time.update();
		this.clear();
		this.update();
		//this.draw();
		Time.clear();
		requestAnimationFrame(this.gameLoop.bind(this));
	}

	this.stop = function(){
		clearInterval(this.interval);
	}
	this.drawLine = function(x1, y1, x2,y2,w, c){
		this.context.beginPath();
		this.context.moveTo(this.offSetX +x1, this.offSetY +y1);
		this.context.lineTo(this.offSetX +x2, this.offSetY +y2);
		this.context.lineWidth = w;

		this.context.strokeStyle = c;
		this.context.stroke();
	}
	this.drawRect = function(x, y, w, h, c){
		this.context.fillStyle = c;
		this.context.fillRect(this.offSetX + x, this.offSetY+ y, w, h);
	}
	this.drawCircle = function(x, y, r, c){
		this.context.fillStyle = c;
		this.context.beginPath();
		this.context.arc(x, y, r, 0, 2 * Math.PI);
		this.context.fill();
	}
	this.drawText = function(x, y, text){
		this.context.fillStyle = "black";
		this.context.font = "20px Arial";
		this.context.fillText(text, this.offSetX + x, this.offSetY + y);
	}
	this.drawSprite = function(img, sx, sy, sw, sh, x, y, w, h){
		this.context.drawImage(img, sx, sy, sw, sh, this.offSetX + x, this.offSetY + y, w, h);
	}
	this.drawImage = function(img, x, y, w, h){
		this.context.drawImage(img, this.offSetX + x, this.offSetY + y, w, h);
	}
	this.drawGUIText = function(x, y, text){
		this.context.fillStyle = "black";
		this.context.font = "20px Arial";
		this.context.fillText(text, x, y);
	}
	this.drawText = function(x, y, text){
		this.context.fillStyle = "black";
		this.context.font = "20px Arial";
		this.context.fillText(text, this.offSetX + x, this.offSetY + y);
	}
	this.drawGUIImage = function(img, x, y, w, h){
		this.context.drawImage(img, x, y, w, h);
	}

	
	if(resize)
		setResize(this.canvas);


	this.Sprite = function(x, y, width, height, image, tilesX , tilesY){
		this.x = x;
		this.y = y;
		this.image = image;
		this.width = width;
		this.height = height;
		this.tilesX = tilesX !== undefined ? tilesX : 1;
		this.tilesY = tilesY !== undefined ? tilesY : 1;
		this.offSetWidth = image.width / this.tilesX;
		this.offSetHeight = image.height / this.tilesY;

		this.animator = null;
		var frameX;
		var frameY;

		this.addAnimation = function(key, frames, rate, loop){
			if(this.animator == null){
				this.animator = new game.Animator(this.tilesX, this.tilesY);
			}

			this.animator.addAnimation(key, new game.Animation(frames, rate, loop));
			if(this.animator.clip==null){
				this.animator.play(key);
			}
		}
		this.draw = function(){
			if(this.x>-100 && this.x>-100 && this.x>-100 &&this.x>-100){

				if(this.animator != null){
					var f = this.animator.animate();
					frameX = f.x;
					frameY = f.y;
				}else{
					frameX = 0;
					frameY = 0; 
				}
				game.drawSprite(this.image, frameX * this.offSetWidth, frameY*this.offSetHeight, this.offSetWidth, this.offSetHeight, this.x, this.y, this.width, this.height);
			}
		}
	}

	this.Animation = function(frames, rate, loop){
		this.frames = frames;
		this.rate = rate;
		this.loop = loop;
	}

	this.Animator = function(tilesX, tilesY){
		this.tilesX = tilesX;
		this.tilesY = tilesY;
		this.animations = {};
		this.clip = null;
		this.startTime = 0;
		this.isPlaying = false;
		this.currentFrame = 0;
		this.frameX = 0;
		this.frameY = 0;

		this.addAnimation = function(key, animation){
			this.animations[key] = animation;
		}
		
		this.play = function(key){
			if(this.clip != this.animations[key]){
				this.startTime = getTime();
				this.clip = this.animations[key];
				this.currentFrame = 0;
				this.isPlaying = true;
			}
		}

		this.stop = function(animation){
			this.isPlaying = false;
		}

		this.animate = function(){
			if(this.isPlaying && this.clip!= null){
				var currentTime = (getTime() - this.startTime) / 1000;		
				if(currentTime > this.clip.rate){
					this.startTime = getTime();
					this.currentFrame++;
					if(this.currentFrame >= this.clip.frames.length && this.clip.loop){
						this.currentFrame = 0;
					}
					if(this.currentFrame >= this.clip.frames.length && !this.clip.loop){
						this.isPlaying = false;
						this.currentFrame--;
					}
				}
			}
			this.frameX = this.clip.frames[this.currentFrame] % this.tilesX || 0;
			this.frameY = Math.floor(this.clip.frames[this.currentFrame] / this.tilesX) || 0;
			return {x: this.frameX, y: this.frameY};
		}
	}

	this.Image = function(x, y, w, h, s){
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.sprite = s;

		this.draw = function(){
			if(this.x>-100 && this.x>-100 && this.x>-100 &&this.x>-100){
				game.drawImage(this.sprite, this.x, this.y, this.width, this.height);
			}
		}
	}

};

function getTime(){
	return (new Date()).getTime();
}
function setResize(el){
	resize(el); 

	window.addEventListener("load", function load(event){
	    window.removeEventListener("load", load, false); //remove listener, no longer needed
	    resize(el);  
	},false);

	window.addEventListener("resize", function res(event){
		resize(el);  
	},false);
}
function resize(el){
	var g = el;
	var p= g.parentElement;

	var pw = p.offsetWidth;
	var ph = p.offsetHeight;
	console.log(ph + " " + pw);

	var gw = g.offsetWidth;
	var gh = g.offsetHeight;
	var aspect = gw / gh;

	if(ph < pw) {
		var resizedHeight = ph;
		var resizedWidth = resizedHeight * aspect;
	}else {
		var resizedWidth = pw;
		var resizedHeight = resizedWidth / aspect;
	}
	if(g.style.position == "absolute"){
		g.style.top = (Math.abs((ph - resizedHeight))/2) + "px";
		g.style.left = (Math.abs((pw - resizedWidth))/2) + "px";
	}else{
		g.style.marginTop = (Math.abs((ph - resizedHeight))/2) + "px";
		g.style.marginLeft = (Math.abs((pw - resizedWidth))/2) + "px";
	}
	g.style.width = resizedWidth+"px";
	g.style.height = resizedHeight+"px";
}
//GAME OBJECTS
function Rect(x, y, w, h, c){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.c = c;
}


function loadImages(sources, callback) {
	var images = {};
	var loadedImages = 0;
	var numImages = 0;
	for(var src in sources) {
		numImages++;
	}
	for(var src in sources) {
		images[src] = new Image();
		images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback(images);
			}
		};
		images[src].src = sources[src];
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

var FPS = {	startTime : 0,	frameNumber : 0,
	getFPS : function(){		
		this.frameNumber++;		
		var d = new Date().getTime(),			
		currentTime = ( d - this.startTime ) / 1000,
		result = Math.floor( ( this.frameNumber / currentTime ) );
		if( currentTime > 1 ){
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}		
		return result;
	}	
};

var Time = {
	oldtime : new Date,
	time : new Date(),
	update : function(){
		this.time = new Date();
		this.deltaTime = (this.time.getTime() - this.oldtime.getTime()) / 1000;
	},
	clear : function(){
		this.oldtime = this.time;
	},
	deltaTime : 0
};

Math.lerp = function (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
};

Math.angleToRad = function(angle){
	return angle * 3.14 / 180;
}
Math.between = function(min,max)
{
	return Math.floor(Math.random()*(max-min+1)+min);
}

var isMobile = {
	Android: function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
	},
	any: function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};

var eventClick = isMobile.any() ? "touchend" : "click";