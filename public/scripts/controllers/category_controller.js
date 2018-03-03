app.controller('CategoryPageController', function($scope, $http) {
	$scope.category = {};
	$scope.id = -1;
	$scope.gamesList = [];

	var res = window.location.href.split("/");
	var index = res.indexOf("category");
	if(index!= -1 && res[index+1]!=null){
		$scope.id = res[index+1];
	}

	
	if($scope.id != -1){
		console.log("entrou");
		$http.get("/api/category/" + $scope.id)
		.then(function(response) {
			$scope.category = response.data;
			$scope.getGames();
		});
	}else{
		window.location="/notfound";
	}

	$scope.getGames = function(){
		$http.get("/api/game/category/" + $scope.id)
		.then(function(response) {
			$scope.gamesList = response.data;
			console.log($scope.gamesList);
		});
	}
});