app.controller('HeaderController', function($scope, $http, $mdToast,$mdDialog) {
	var socket = io.connect('http://localhost:9000');
	var first = true;
	var notification = document.getElementById("notification_audio");
	socket.on("notifications", onNotifications);
	socket.on("notify", onNotify);

	$scope.invites = [];
	$scope.friends = [];

	$scope.teste = "ola";

	function onNotify(){
		console.log("notify");
		socket.emit("notifications");
	}
	function onNotifications(data){
		if(!first){
			if($scope.invites.length != data.invites.length){
				$scope.showActionToast("You were invited for a game!");
			}else if($scope.friends.length != data.friends.length){
				$scope.showActionToast("You have a new friend request!");
			}
		}
		first = false;

		$scope.$apply(function () {
			$scope.invites  = data.invites;
			$scope.friends  = data.friends;
		});
	}
	$scope.showActionToast = function(str) {
		var toast = $mdToast.simple()
		.textContent(str)
		.action('SHOW') 
		.highlightAction(true)
		.highlightClass('md-accent')
		.position('bottom right');

		notification.play(); 

		$mdToast.show(toast).then(function(response) {
			if ( response == 'ok' ) {
				$mdToast.close();
			}
		});
	};

	$scope.Login = getCookie("login")== 'true' ? true : false;
	$scope.User = {hasLogin: (getCookie("login") == 'true' ? true : false), username: "", avatar:""};
	
	if($scope.Login){
		$scope.User.username = getCookie("user");
		$scope.User.avatar = getCookie("avatar");

		socket.emit("login", {token: getCookie("token")});
	}
	var originatorEv;
	$scope.openMenu = function($mdOpenMenu, ev){
		originatorEv = ev;
		$mdOpenMenu(ev);
	};
	$scope.closeMenu = function(){
		$mdOpenMenu(originatorEv);
	};

	$scope.logout = function(){
		$http({
			url: '/api/logout',
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		})
		.then(function(response) {
			if(response.data.success){
				setCookie("token", "");
				setCookie("user", "");
				setCookie("login", false);

				$scope.showAlert("Logout with success!");
				setTimeout(function(){
					window.location.href="/";
				},1000);
			}
		},
		function(response){
			alert("Error " + response.data);
		});
	}

	if($scope.User.hasLogin){
		$http({
			url: '/api/checklogin',
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		})
		.then(function(response) {
			console.log(response.data);
			if(!response.data.success){
				setCookie("token", "");
				setCookie("user", "");
				setCookie("login", false);
				window.location.href="/";
			}

		},
		function(response){
			console.log(response.data);
			if(response.status == '403'){
				setCookie("token", "");
				setCookie("user", "");
				setCookie("login", false);
				window.location.href="/";
			}
		});
	}

	$scope.showAlert = function(title) {
		$mdDialog.show(
			$mdDialog.alert()
			.parent(angular.element(document.querySelector('#popupContainer')))
			.clickOutsideToClose(true)
			.title("Multiplayer Time")
			.textContent(title)
			.ariaLabel('Alert')
			.ok('OK')
			.targetEvent(null)
			);
	};

	
});

