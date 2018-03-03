
function getServer(game){
	var url  = "http://127.0.0.1";
	//var url  = "http://172.20.128.169";
	if(game == "sueca"){
		return url + ":8000";
	}
	if(game == "stickMontainsServer"){
		return url + ":8002";
	}
	if(game == "fromTheTowerServer"){
		return url + ":8003";
	}
	if(game == "fourInRow"){
		return url + ":8004";
	}
	if(game == "bulletWar"){
		return url + ":8005";
	}
	if(game == "flyingUnicorns"){
		return url + ":8006";
	}
	if(game == "dangerousForest"){
		return url + ":8007";
	}
}

function client(url, parent, actions){
	var socket = io(url, {transports: ['websocket']});
	var player = null;
	var players = [];
	var room = null;
	var actions = actions;
	var loginCallback;

	var _self = this;

	socket.on("joinRoom", joinRoom);
	socket.on("quickRoom", quickRoom);
	socket.on("exitRoom", exitRoom);
	socket.on("newPlayer", newPlayer);
	socket.on("removePlayer", removePlayer);
	socket.on("error", error);
	socket.on("you", you);

	function you(data){
		if(data.success){
			player = data;
			var params = window.location.href.split("/");
			if(params.length == 6){
				_self.joinRoom(params[params.length-1]);
			}else{
				loginCallback(data.success);
			}
		}else{ 
			loginCallback(false, data.error);
		}
	}

	this.getID = function(){
		return player.id;
	}
	this.getUsername = function(){
		return player.username;
	}

	this.createGame = function(){
		socket.emit("createRoom");
	}
	this.exitRoom = function(){
		socket.emit("exitRoom");
	}

	this.findGame = function(){
		socket.emit("quickRoom");
	}
	this.invite = function(users){
		//TODO
	}
	this.login = function(callback){
		loginCallback = callback;

		if(getCookie("login") == "true"){
			socket.emit("login",{token : getCookie("token")});
		}else{
			loginCallback(false, 0);
		}
	}
	this.joinRoom = function(room){
		console.log("JOIN " + room);
		socket.emit("joinRoom", {id: room}); 
	}
	this.startGame = function(){
		socket.emit("startGame");
	}

	this.invite = function(){
		var scope = angular.element(document.getElementById("GameController")).scope();
		scope.$apply(function () {
			scope.showFriends(client.getRoom());
		});
	}

	this.invites = function(){
		var scope = angular.element(document.getElementById("GameController")).scope();
		scope.$apply(function () {
			scope.showInvites();
		});
	}

	function quickRoom(data){
		if(data.success){
			socket.emit("joinRoom", {id: data.id});
		}else{
			socket.emit("createRoom");
			/*if(actions["findGame"]!=undefined){
				actions["findGame"](null);
			}*/
		}
	}
	function joinRoom(data){
		room = data.id;
		players = [];

		if(actions["createGame"]!=undefined){
			actions["createGame"]();
		}
	}

	this.getRoom = function(){
		return room;
	}

	this.getPlayers = function(){
		return players;
	}

	function exitRoom(data){
		console.log(data);
		if(data.state){
			room = null;
			players = [];
			if(actions["exitRoom"]!=undefined){
				actions["exitRoom"]();
			}
		}
	}
	function newPlayer(data){		
		//data.name
		players.push(data)
		var _player = players[players.length-1];
		var img = new Image();
		var flag = new Image();
		img.src=data.avatar;
		flag.src="/images/flags/32/"+data.country+".png";
		_player.img = img;
		_player.flag = flag;
	}

	function removePlayer(data){
		var index = getPlayer(data.id);
		if(index!=-1){
			players.splice(index, 1);
		}
	}
	function getPlayer(id){
		for(var i = 0; i < players.length; i++){
			if(players[i].id == id)
				return i;
		}
		return -1;
	}
	this.getPlayer = function(id){
		for(var i = 0; i < players.length; i++){
			if(players[i].id == id)
				return players[i];
		}
		return null;
	}
	function error(data){
		alert(data.error);
	}

	this.on = function(message, callback){
		socket.on(message, callback);
	}

	this.emit = function(message, args){
		socket.emit(message, args);
	}
}
