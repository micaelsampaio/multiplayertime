app.controller('GameController', function($scope, $http, $mdDialog, $mdToast) {
	$scope.game = {};
	$scope.invites = [];
	$scope.friends = [];
	$scope.id = getCookie("id");

	var params = window.location.href.split("/");
	var id = params[4];
	

	$http.get("/api/game/route/"+id)
	.then(function(response) {
		$scope.game = response.data;
		console.log($scope.game);
	});
	console.log("GAME -------");

	$scope.getFriends = function(){
		$http.get("/api/friend/list/"+$scope.id)
		.then(function(response) {
			$scope.friends = response.data;
			console.log($scope.friends);
		});
	}

	if(getCookie("login") == "true"){

		$scope.getFriends();
	}

	$scope.sendInvite = function(invites, room, game){
		console.log(invites);
		$http({
			url: '/api/room/invite/'+room,
			method: "POST",
			data : {
				game: game,
				id : invites
			},
			headers: {
				'Authorization': getCookie("token")
			}
		})
		.then(function(response) {
			$scope.showActionToast();
		});
	}


	$scope.showAlert = function(ev) {
		$mdDialog.show(
			$mdDialog.alert()
			.parent(angular.element(document.querySelector('#popupContainer')))
			.clickOutsideToClose(true)
			.title('This is an alert title')
			.textContent('You can specify some description text in here.')
			.ariaLabel('Alert Dialog Demo')
			.ok('Got it!')
			.targetEvent(ev)
			);
	};

	$scope.showFriends = function(room) {
		$mdDialog.show({
			locals:{friends: $scope.friends}, 
			controller: DialogController,
			templateUrl: '/friendList.html',
			parent: angular.element(document.body),
			targetEvent: null,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen 
		})
		.then(function(invites) {
			if(invites.length>0){
				$scope.sendInvite(invites, room, $scope.game.id);
			}
		}, function() {
			//canceled
		});
	};

	$scope.showInvites = function() {
		$mdDialog.show({
			locals:{game: $scope.game.id, route: $scope.game.route}, 
			controller: Dialog2Controller,
			templateUrl: '/myinvites.html',
			parent: angular.element(document.body),
			targetEvent: null,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen 
		})
		.then(function(invites) {
			if(invites.length>0){
				$scope.sendInvite(invites, room, game);
			}
		}, function() {
			//canceled
		});
	};

	function DialogController($scope, $mdDialog, friends) {
		$scope.invites = [];
		$scope.friends = friends;

		console.log($scope.friends);

		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.invite = function(answer) {
			$mdDialog.hide($scope.invites);
		};

		$scope.addChip = function(user){
			var index = $scope.invites.indexOf(user);
			if(index == -1)
				$scope.invites.push(user);
		}
	}

	function Dialog2Controller($scope, $mdDialog, game, route) {
		$scope.invites = [];

		$http({
			url: '/api/room/invite/game/'+ game,
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		})
		.then(function(response) {
			$scope.invites = response.data;
		});

		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.join = function(inv) {

			$http({
				url: '/api/room/invite/remove/'+ inv.id,
				method: "GET",
				headers: {
					'Authorization': getCookie("token")
				}
			}).then(function(response) {
				if(response.data.success){
					window.location.href = "/game/"+route+"/"+inv.room;
				}
			});
		};
	}

	$scope.showActionToast = function() {
		var toast = $mdToast.simple()
		.textContent('Invites Sent!')
		.action('CLOSE')
		.highlightAction(true)
      .highlightClass('md-accent')
      .position('bottom right');

      $mdToast.show(toast).then(function(response) {
      	
      });
  };


});