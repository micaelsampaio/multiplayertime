app.controller('InviteController', function($scope, $http) {
	$scope.invites = [];
	$http({
		url: '/api/room/invite/',
		method: "GET",
		headers: {
			'Authorization': getCookie("token")
		}
	}).then(function(response) {
		$scope.invites = response.data;
	},
	function(response){
		console.log(response);
	});
});