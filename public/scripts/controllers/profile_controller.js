app.controller('ProfileController', function($scope, $http, $mdToast, $mdDialog) {
	$scope.id = getCookie("user");
	$scope.user = {};
	$scope.friends = {};
	$scope.button = {text: "", action: null, visible : false};
	$scope.Login = getCookie("login")== 'true' ? true : false;
	$scope.You = false;

	var params = window.location.href.split("/");

	$scope.getFriends = function(){
		$http.get("/api/friend/list/"+$scope.user.id)
		.then(function(response) {
			$scope.friends = response.data;console.log($scope.friends);
		});
	}
	
	$scope.addFriend = function(){
		$http({
			url: '/api/friend/add/'+$scope.user.id,
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		})
		.then(function(response) {
			$scope.showToast("Friend Request Sent!");
			$scope.button.text = "remove friend request";
			$scope.button.action = $scope.unfriend;
		},
		function(response){
			console.log(response);
			alert("ERRO");
		});
	}
	$scope.acceptFriend = function(){
		$http({
			url: '/api/friend/accept/'+$scope.user.id,
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		}).then(function(response){
			
			$scope.showToast("You have a new friend!");
			$scope.button.text = "unfriend";
			$scope.button.action = $scope.unfriend;

		},
		function(response){
			
		});
	}
	$scope.unfriend = function(){
		console.log('/api/friend/remove/'+$scope.user.id);
		
		$http({
			url: '/api/friend/remove/'+$scope.user.id,
			method: "GET",
			headers: {
				'Authorization': getCookie("token")
			}
		})
		.then(function(response) {
			if(response.data.success){
				$scope.button.text = "add friend";
				$scope.button.action = $scope.addFriend;
			}
			$scope.showToast(response.data.description);
		},
		function(response){
			console.log(response);
			alert("ERRO");
		});
	}

	var originatorEv;
	$scope.openMenu = function($mdOpenMenu, ev){
		originatorEv = ev;
		$mdOpenMenu(ev);
	};
	$scope.closeMenu = function(){
		$mdOpenMenu(originatorEv);
	};

	$scope.showToast = function(text) {
		$mdToast.show(
			$mdToast.simple()
			.textContent(text)
			.position('bottom right')
			.hideDelay(3000)
			);
	};

	$scope.showAlert = function() {
		$mdDialog.show(
			$mdDialog.alert()
			.parent(angular.element(document.querySelector('#popupContainer')))
			.clickOutsideToClose(true)
			.title('This is an alert title')
			.textContent('You can specify some description text in here.')
			.ariaLabel('Alert Dialog Demo')
			.ok('Got it!')
			.targetEvent(null)
			);
	};

	$scope.changeAvatar = function(id) {
		

		$mdDialog.show({
			locals:{}, 
			controller: DialogAvatarController,
			templateUrl: '/profile_avatar.html',
			parent: angular.element(document.body),
			targetEvent: null,
			clickOutsideToClose:true,
			fullscreen: false 
		})
		.then(function(avatar) {
			console.log(avatar);
			if(avatar){
				var fd = new FormData();
				fd.append("avatar", avatar);

				$http.post("/api/user/avatar/", fd, {

					withCredentials : false,

					headers : {
						'Content-Type' : undefined,
						'Authorization': getCookie("token")
					},
					transformRequest : angular.identity

				}).then(function(response) {
					console.log(response);
					if(response.data.success){
						setCookie("avatar", response.data.description);
						window.location.reload(false);
					}
				}, function(response) {
					console.log(response);
					alert("erro");
				});
			}
		}, function() {
			//canceled
		});
	};
	$scope.changePassword = function(id) {
		

		$mdDialog.show({
			locals:{}, 
			controller: DialogPasswordController,
			templateUrl: '/dialog_password.html',
			parent: angular.element(document.body),
			targetEvent: null,
			clickOutsideToClose:true,
			fullscreen: false 
		})
		.then(function(data) {
			console.log(data);
			$http({
				url: '/api/user/password',
				method: "POST",
				data : data,
				headers: {
					'Authorization': getCookie("token")
				}
			})
			.then(function(response) {
				$scope.showToast(response.data.success ? "Password updated!" : "Password won't match");
			})
		}, function() {
			//canceled
		});
	};

	function DialogAvatarController($scope, $mdDialog) {
		$scope.newAvatar = null;

		$scope.hide = function() {
			$mdDialog.hide($scope.newAvatar);
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};
	}
	function DialogPasswordController($scope, $mdDialog) {
		$scope.password = "";
		$scope.newpassword = "";
		$scope.confirmpassword = "";

		$scope.hide = function() {
			console.log($scope.password + " " + $scope.newpassword + " - "  + $scope.confirmpassword);
			if($scope.password.length==0){
				return;
			}
			if($scope.newpassword.length==0 || $scope.newpassword != $scope.confirmpassword){
				return;
			}

			$mdDialog.hide({password: $scope.password, newpassword: $scope.newpassword});
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};
	}

	$http.get("/api/user/" + params[params.length-1])
	.then(function(response) {
		$scope.user = response.data;
		$scope.You = $scope.Login ? getCookie("user") == $scope.user.username : false;
		$scope.getFriends();

		$scope.button.visible = true;
		console.log(response.data.isFriend);
		switch (response.data.isFriend) {
			case 'friend':
			$scope.button.text = "unfriend";
			$scope.button.action = $scope.unfriend;
			break;
			case 'nofriend':
			$scope.button.text = "add friend";
			$scope.button.action = $scope.addFriend;
			break;
			case 'you':
			$scope.button.visible = false;
			break;
			case 'friendrequest':
			$scope.button.text = "Accept friend";
			$scope.button.action = $scope.acceptFriend;
			break;
			case 'friendrequestsent':
			$scope.button.text = "remove friend request";
			$scope.button.action = $scope.unfriend;
			break;
			default:
			$scope.button.visible = false;
		}

	});
});

var compareTo = function() {
	return {
		require: "ngModel",
		scope: {
			otherModelValue: "=compareTo"
		},
		link: function(scope, element, attributes, ngModel) {

			ngModel.$validators.compareTo = function(modelValue) {
				return modelValue == scope.otherModelValue;
			};

			scope.$watch("otherModelValue", function() {
				ngModel.$validate();
			});
		}
	};
};

function passwordVerify() {
	return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, elem, attrs, ngModel) {
        if (!ngModel) return; // do nothing if no ng-model

        // watch own value and re-validate on change
        scope.$watch(attrs.ngModel, function() {
        	validate();
        });

        // observe the other value and re-validate on change
        attrs.$observe('passwordVerify', function(val) {
        	validate();
        });

        var validate = function() {
          // values
          var val1 = ngModel.$viewValue;
          var val2 = attrs.passwordVerify;

          // set validity
          ngModel.$setValidity('passwordVerify', val1 === val2);
      };
  }
}
}
app.directive('passwordVerify', passwordVerify);