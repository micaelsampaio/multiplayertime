console.log(getServer("bulletWar"));

var client;

//game 


var ping = 0;
var pingTime;
var currentPingTime = 0;

var game = new Engine("game", 900, 1200, {"resize": true});

game.start(loading);
game.loadImage("police","/games/stick-mountains/assets/police.png");
game.load(onLoad);

var obj = new game.Rect(0,0, 10, 10, "rgba(255,0,0,0.5)");

function onLoad(){
	client = new client(getServer("bulletWar"), "gamecontainer",
		{"exitRoom": exitRoom});

	client.on("startGame", onStartGame);
	client.on("getPing", onGetPing);
	client.on("position", onPosition);
	client.on("position2", onPosition2);
	client.on("serverCurrentTime", onServerCurrentTime);
	client.on("serverTime", onServerTime);
	client.on("serverTime2", onServerTime2);
	client.on("move", onMove);
	client.on("reach", onReach);
	client.login(onLogin);
}

function onLogin(success){
	if(success){
		game.update = menu;
	}else{
		game.update = erro;
	}
}

////SERVER RESPONSES

function loading(){

	game.drawGUILabel(0, game.height - 200, game.width, 200,  "Loading", "black", "60px Arial", "center", "middle"); 
	
}

function menu(){
	if(game.Button(200, 50, 200, 50, "CREATE GAME", "white", "blue")){
		client.createGame();
		game.update = lobby;
	}

	if(game.Button(200, 250, 200, 50, "QUICK FIND", "white", "blue")){
		client.findGame();
		game.update = lobby;
	}
	
}

function erro(){
	if(game.Button(200, 50, 200, 50, "Login", "white", "blue")){
		window.location="/login";
	}
	
}
function exitRoom(){
	game.update = menu; 
}
function lobby(){
	game.drawGUIText(10, 30, client.getRoom());
	//console.log(client.getPlayers());

	var y = 70 + 50;
	var x = 10;
	for(var i = 0; i < client.getPlayers().length; i++){
		game.drawRect(x, y, 200, 300, "white");
		
		game.drawImage(client.getPlayers()[i].img, x +10, y + 10, 180, 180);
		game.drawImage(client.getPlayers()[i].flag, x+85, y + 190, 30, 30);

		//game.drawGUIText(x+10, y + 325, "WWWWWWWWWWWWWWW");
		game.drawGUILabel(x+200/2, y + 240, 300, 50, client.getPlayers()[i].username);
		

		x+= 360;
	}

	if(game.Button(10, 450, 200, 50, "Exit Room", "white", "blue")){
		client.exitRoom();
	}
	if(game.Button(220, 450, 200, 50, "START GAME", "white", "blue")){
		client.startGame();
	}
}

function onReady(data){
	
}
function onStartGame(data){
	console.log("START GAME");

	serverTime = data.serverTime;
	serverTime2 = data.serverTime;

	obj = new game.Rect(data.objs[0].x, data.objs[0].y, data.objs[0].width, data.objs[0].height, "blue");
	obj2 = new game.Rect(data.objs[0].x, data.objs[0].y + 200, data.objs[0].width, data.objs[0].height, "blue");
	obj3 = new game.Rect(data.objs[1].x, data.objs[1].y , data.objs[1].width, data.objs[1].height, "black");
	objSpeed = data.objs[0].speed;
	objSpeed2 = data.objs[0].speed;
	obj3Speed = data.objs[1].speed;

	obj4 = new game.Rect(0, 400, 50, 50, "#96F");
	obj5 = new game.Rect(0, 400, 50, 50, "rgba(255,0,0,0.5)");

	serverX = obj2.x;
	game.update = update;
}

var serverTime = 0;

var serverTime2 = 0;
var serverTimeRequest =0 ;
var ping2 = 0;

var obj2;
var timerMove = 0;
var obj;
var obj4;
var obj5;
var objSpeed;
var objSpeed2;
var obj3Speed;
var move = true;
var move2 = false;

var diff = [0,0,0,0,0,0,0,0,0,0];
var currentDiff = 0;
var lastUpdate = (new Date()).getTime();
var wantedX = 0;
var wantedX3 = 0;
var positions = [];
var serverX = 0;

var positions2 = [{x: 0, t:0},
{x: 800, t:1},
{x: 0, t:2},
{x: 800, t:3},
{x: 0, t:4},
{x: 800, t:5},
{x: 0, t:6}

];

var currentTime = 0;
var serverCurrentTime = 0;
var timerMove = 0;
function update(){
	currentTime+= game.deltaTime;
	currentPingTime += game.deltaTime;
	serverTimeRequest += game.deltaTime;

	if(currentPingTime > 1){
		currentPingTime = 0;
		pingTime = Date.now();
		setTimeout(function(){
			client.emit("getPing");
		}, 300);
	}

	if(serverTimeRequest > 2){
		serverTimeRequest = 0;
		setTimeout(function(){
			client.emit("getTime");
		}, 300);
		ping2 = (new Date()).getTime();
	}

	serverTime2 += game.deltaTime*1000;

	if(move2){
		obj3.x += obj3Speed * game.deltaTime;
		timerMove += game.deltaTime;

		if(obj3.x + obj3.width > game.width){
			obj3Speed*=-1;
			obj3.x = game.width - obj3.width;
			move2 = false;
		}

		if(obj3.x < 0){ 
			obj3Speed*=-1;
			obj3.x = 0;
			move2 = false;
		}
	}

	
	if(move){

		var newX = game.lerp(obj2.x,serverX, game.deltaTime* 10).fixed();

		obj2.x = newX;

		
		if(obj2.x + obj2.width > game.width){
			objSpeed*=-1;
			obj2.x = game.width - obj.width;
		}
		if(obj2.x < 0){ 
			objSpeed*=-1;
			obj2.x = 0;
		}
	}else{
		move = true;
	}
	

	obj.draw();
	obj2.draw();
	obj3.draw();
	//OBJ4
	var target = null;
	var previous = null;
	var count = positions2.length -1;
	var SX;

	for(var i = 0; i < count; ++i) {

		var point = positions2[i];
		var next_point = positions2[i+1];

		if(currentTime > point.t && currentTime < next_point.t) {
			target = next_point;
			previous = point;
			SX = i;
			break;
		}
	}

	if(target && previous) {
		game.drawLine(previous.x, obj4.y, target.x, obj4.y, "rgba(0, 255, 0, 0.8)");
		obj5.x = target.x;
		obj5.draw();

		var difference = target.t - currentTime;
        var max_difference = (target.t - previous.t).fixed(3);
        var time_point = (difference/max_difference).fixed(3);

        
		obj4.x = game.lerp(previous.x, target.x, (currentTime - previous.t) / (target.t - previous.t)); 
		console.log("TIME S:" + (currentTime - previous.t) + " F:" + (target.t - previous.t) + "\n " +obj4.x+" "+(SX));
	}
	obj4.draw();
	
	game.drawLine(obj.x, obj.y, obj2.x, obj2.y, 5, "green");

	game.drawGUIText(80, 60, msToTime(serverTime) +" // "+ serverTime, "black", "40px Arial");

	game.drawGUIText(80, 100, msToTime(serverTime2)+" // "+ serverTime2, "black", "40px Arial");

	game.drawGUIText(100, 160, currentTime.fixed() , "black", "40px Arial");
	
	game.drawGUIText(100, 200, serverCurrentTime.fixed() , "black", "40px Arial");
	
	
	for(var i = 0; i < diff.length; i++){
		game.drawGUIText(80 + i*80, 240, diff[i], "black", "40px Arial");
	}
	


	game.drawGUIText(10, 30, game.getFPS());

	game.drawGUIText(10, 200, ping, "black", "40px Arial");

	lastUpdate = (new Date()).getTime();
}

var follow = true;
function onPosition(data){
	obj.x = data.x;
	obj.y = data.y;
	objSpeed = data.speed;
	
}
function onReach(data){
	//console.log(msToTime(serverTime2) + " " + msToTime(data.serverTime));
	//console.log(serverTime2 - data.serverTime);
	//console.log("REACH -----------> " + (move2 ? "CLIENT FIRST" : "SERVER FIRST"));
}
function onMove(data){
	//console.log("MOVE: " + (offset * data.speed));
	move2 = true;
	obj3.x = data.x;
	obj3Speed = data.speed;
}

function onPosition2(data){
	//console.log("________________________________________________");
	//console.log(msToTime(serverTime2) + " " + msToTime(data.serverTime));
	//console.log(serverTime2 - data.serverTime);
	//console.log(timerMove * 1000 + " " + data.timer * 1000);
	//console.log(timerMove * 1000 - data.timer * 1000);

	/*if(data.speed > 0 ){
		console.log(obj2.x + " " + data.x + " " + (data.x>obj2.x ? "server" : "client")); 
	}else{
		console.log(obj2.x + " " + data.x + " " + (data.x<obj2.x ? "server" : "client")); 
	}
	console.log(obj2.x-data.x); 
	if(Math.abs(obj2.x-data.x) > 20){
		obj2.x = data.x;
		move = false;
	}
	timerMove = 0;
	positions.push(data.x);
	objSpeed = data.speed;*/
	serverX = data.x;
	follow = true;
	
}
function onServerCurrentTime(data){
	serverCurrentTime = data.serverTime;
	

	diff[currentDiff] = (serverCurrentTime*1000 - currentTime*1000).fixed(); //serverTime2 - serverTime;
	currentDiff++;
	if(currentDiff >= diff.length){
		currentDiff = 0;
	}

	currentTime = data.serverTime;
}
function onServerTime(data){
	serverTime = data.serverTime;
}
function onServerTime2(data){
	ping2 = parseInt(((new Date()).getTime() - ping2) / 2);
	var offset = (new Date()).getTime() - lastUpdate;
	serverTime2 = data.serverTime + ping2 - offset;
}
function onGetPing(data){
	ping = ((new Date()).getTime() - pingTime);
}

var hitTime = 0;

function msToTime(duration) {
	var milliseconds = parseInt((duration%1000)/100)
	, seconds = parseInt((duration/1000)%60)
	, minutes = parseInt((duration/(1000*60))%60)
	, hours = parseInt((duration/(1000*60*60))%24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
