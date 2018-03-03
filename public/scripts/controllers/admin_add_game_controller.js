app.controller('AdminAddGameController', function($scope, $http, $routeParams) {

  $scope.id = $routeParams.ID;
  $scope.edit = $scope.id == undefined ? false : true;

  $scope.game = {id:"",route: "", name: "", description: "", min_players: 0, max_players: 0, color: "#000", category: null};

  $scope.categories = [];

  $scope.fileCardImage = null;
  $scope.fileLogo = null;

  $scope.addGame = function(){
    console.log("ADD GAME");
    
    $scope.game.min_players = Number($scope.game.min_players);
    $scope.game.max_players = Number($scope.game.max_players);

    var fd = new FormData();
    fd.append("card_image", $scope.fileCardImage);
    fd.append("logo", $scope.fileLogo);
    fd.append("name", $scope.game.name);
    fd.append("route", $scope.game.route);
    fd.append("description", $scope.game.description);
    fd.append("min_players", $scope.game.min_players);
    fd.append("max_players", $scope.game.max_players);
    fd.append("color", $scope.game.color);
    fd.append("category_id", $scope.game.category.id);

    $http.post("/api/game" + ($scope.edit ? "/"+$scope.id : ""), fd, { 

      withCredentials : false,

      headers : {
        'Content-Type' : undefined,
        'Authorization': getCookie("token")
      },
      transformRequest : angular.identity

    }).then(function(response) {
      console.log(response);
      alert(response.success ? "success" : response.data.description);
    }, function(response) {
      alert("erro");
    });
  };

  $scope.save = function(){

    $scope.addGame();
    
  };


  $scope.getGame = function(){
    var token = getCookie("token");

    $http({
      url: '/api/game/'+$scope.id,
      method: "GET",
      headers: {
        'Authorization': getCookie("token")
      }
    })
    .then(function(response) {
      $scope.game = response.data;
      console.log($scope.game);
    })
  };


  $http({
    url: '/api/category',
    method: "GET",
    headers: {
      'Authorization': getCookie("token")
    }
  })
  .then(function(response) {
    $scope.categories = response.data;
  });



  if(!$scope.edit){
    $scope.title = "New Game";
    $scope.btText = "Add Game";
  }else{
    $scope.title = "Edit Game";
    $scope.btText = "Save Game";
    $scope.getGame();
  }

});