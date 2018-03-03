app.controller('LoginController', function($scope, $http, $mdDialog) {

	$scope.username= "";
	$scope.password= "";

	angular.element(document).ready(function () {
		$scope.temp = $scope.password;
		$scope.password= $scope.temp;
	});

	$scope.login = function(){
		$http({
			url: '/api/login',
			method: "POST",
			data :{ username: $scope.username, password: $scope.password}
		})
		.then(function(response) {
			if(response.data.success){
				setCookie("token", response.data.token);
				setCookie("id", response.data.id);
				setCookie("user", response.data.username);
				setCookie("avatar", response.data.avatar);
				setCookie("login", true);

				$scope.showAlert("Login was a success!");

				setTimeout(function(){
					window.location.href="/";
				}, 1000);
			}else{
				setCookie("token", "");
				setCookie("id","");
				setCookie("user", "");
				setCookie("avatar", "");
				setCookie("login", false);
			}
		},
		function(response){
			alert("Error");
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