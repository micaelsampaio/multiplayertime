app.controller('FriendsController', function($scope, $http, $mdToast, $window) {
	$scope.friends = [];
	$scope.friendsSent = [];

	$http({
		url: '/api/friend/requests/',
		method: "GET",
		headers: {
			'Authorization': getCookie("token")
		}
	}).then(function(response) {
		$scope.friends = response.data;
	},
	function(response){
		console.log(response);
	});

	$http({
		url: '/api/friend/requestssent/',
		method: "GET",
		headers: {
			'Authorization': getCookie("token")
		}
	}).then(function(response) {
		$scope.friendsSent = response.data;
		console.log($scope.friendsSent);
	},
	function(response){
		console.log(response);
	});

	$scope.showSimpleToast = function(str) {
		$mdToast.show(
			$mdToast.simple()
			.textContent(str)
			.position('bottom right')
			.hideDelay(2500)
			);
	};
	$scope.showActionToast = function(str) {
		var toast = $mdToast.simple()
		.textContent(str)
		.action('CLOSE')
		.highlightAction(true)
		.highlightClass('md-accent')
		.position('bottom right');

		$mdToast.show(toast).then(function(response) {
			if ( response == 'ok' ) {
				//$mdToast.close();
			}
		});
	};

	$scope.addFriend = function(friend){
		$http({
			url: '/api/friend/accept/'+friend.id,
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		}).then(function(response){
			var index = $scope.friends.indexOf(friend);
			console.log(index);
			if(index != -1){
				$scope.showActionToast(friend.username + " is now your friend!");
				$scope.friends.splice(index, 1);
			}
		},
		function(response){
			console.log(response);
		});
	}
	$scope.removeFriend = function(friend){
		$http({
			url: '/api/friend/remove/'+friend.id,
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		}).then(function(response) {
			var index = $scope.friends.indexOf(friend);
			console.log(index);
			if(index != -1){
				$scope.showActionToast(friend.username + " friend request were removed!");
				$scope.friends.splice(index, 1);
			}
		},
		function(response){
			console.log(response);
		});
	}
	$scope.removeRequest = function(friend){
		$http({
			url: '/api/friend/remove/'+friend.id,
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		}).then(function(response) {
			var index = $scope.friendsSent.indexOf(friend);
			if(index != -1){
				$scope.showActionToast(friend.username + " friend request sent were removed!");
				$scope.friendsSent.splice(index, 1);
			}
		},
		function(response){
			console.log(response);
		});
	}

	$scope.data = [];
	$scope.selectedItem = null;
	$scope.searchText = "";

	$scope.querySearch = function (query) {
		console.log("SEARCH '"+query+"'");
		
		if(query && query.length > 0){
			$http({
				url: '/api/user/find/'+ query.toLowerCase(),
				method: "GET"
			}).then(function(response) {
				console.log(response.data);
				$scope.data = response.data;
				return response.data;
			},
			function(response){
				console.log("ERRO");
				return [];
			});
		}else{
			console.log("VAZIO");
			return [];
		}
	}

	$scope.searchTextChange = function(text) {
		console.log('Text changed to ' + text);
	}
	$scope.selectedItemChange = function(user){
		$window.location.href = '/u/'+user.username;
	}
});