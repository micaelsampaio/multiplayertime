var client = new client("http://192.168.1.69:8001", "controls");

client.on("startGame", onStartGame);
client.on("position", onPosition);

//load images
var sources = {};

//ui menus

//ui images
var loadedImages;

//game 
var gameArea = new GameArea("game");

var players = [];
var objects = [{x:0, y: 10}, {x:3, y: 20}, {x:0, y: 25}, {x:20, y: 40}, {x:0, y: 60}, 
{x:10, y: 90}, {x:0, y: 140}, {x:0, y: 220}, {x:0, y: 356}, {x:1, y: 543}, {x:0, y: 800}, {x:0, y: 870}, {x:0, y: 1200}, {x:0, y: 1500}, {x:0, y: 2000}, {x:0, y: 2300},
 {x:0, y: 2500}, {x:0, y: 3000}, {x:0, y: 3300},{x:0, y: 3400}];

var mPlayer;

function update(){
	gameArea.clear();

	players[mPlayer].update();
	
	for(var i = 0; i < objects.length; i++){
		gameArea.drawRect(objects[i].x, objects[i].y, 20, 20, "#FF3465");
	}

	for(var i = 0; i < players.length; i++){
		players[i].y = players[mPlayer].y;
		players[i].draw();
	}

	gameArea.drawGUIText(10, 30, ""+ players[mPlayer].y);
}


function onStartGame(data){
	console.log(data);
	var w = data.width;
	var h = data.height;
	var speed = data.speed;

	for(var i = 0; i< data.players.length; i++){
		var player = data.players[i];
		if(player.name == client.getID()){
			mPlayer = i;
		}

		players.push( new Player(player.name, w, h, speed, player.x, 0, player.color));
	}

	console.log(players);
	console.log(objects);

	gameArea.start(update);

	setInterval(function(){
		client.emit("position");
	}, 500);
}

function Player(id, width, height, speed, x, y, color){
	this.id = id;
	this.width = width;
	this.height = height;
	this.speed = speed;
	this.x = x;
	this.y = y;

	this.draw = function (){
		gameArea.drawRect(this.x, this.y, this.width, this.height, this.color);
	}
	this.update = function(){
		this.y += this.speed * Time.deltaTime;
		gameArea.offSetY = -(this.y -100);
	}
}

function onPosition(data){
	players[mPlayer].y = data.y;
}