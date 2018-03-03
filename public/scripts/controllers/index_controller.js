app.controller('IndexController', function($scope, $http) {
	$scope.gamesList = [];
	
	$http.get("/api/game/recent")
		.then(function(response) {
		$scope.gamesList = response.data;
	});
});