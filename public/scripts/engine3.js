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

function ENGINE(canvas, width, height){
	this.canvas = document.getElementById(canvas);
	this.canvas.width = width || 800;
	this.canvas.height = height || 600;
	this.context = this.canvas.getContext("2d");
	var offSetX = 0;
	var offSetY = 0;
	var camera;
	
	///
	this.ola = function(obj){
		console.log("Ola");
		console.log(obj == null ? this : obj);
	}
}

ENGINE.prototype.Camera = function(game, x, y){
	var game = game;
	var x = x || 0;
	var y = y || 0;
	var target = null;
	var offSetX = 0;
	var offSetY = 0;

	this.setX = function(x){
		x = x;
	}
	this.setY = function(y){
		y = y;
	}
	this.getPosition = function(){
		return {x: x, y: y};
	}

	game.ola(this);
}

ENGINE.prototype.Teste = function(game, i){
	var t = i;

	game.ola(this);
}
