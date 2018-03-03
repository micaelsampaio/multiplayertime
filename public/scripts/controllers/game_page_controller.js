app.controller('GamePageController', function($scope, $http) {
	$scope.categoriesList = [];
	$scope.gamesList = [];
	$http.get("/api/category")
	.then(function(response) {
		$scope.categoriesList = response.data;
	});

	$http.get("/api/game")
	.then(function(response) {
		$scope.gamesList = response.data;
	});
});