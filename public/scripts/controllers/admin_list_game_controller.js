app.controller('AdminListGamesController', function($scope, $http, $mdDialog, $location) {
  $scope.games = [];
  $scope.selectedGames = [];

  $scope.getGames = function(){
    var token = getCookie("token");

    $http({
      url: '/api/game',
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getCookie("token")
      }
    })
    .then(function(response) {
      $scope.games = response.data;
      $scope.selectedGames = [];
    })
  };
  $scope.go = function ( path ) {
    $location.path( "game/" + path );
  };
  $scope.deleteGames = function(){
      $http({
      url: '/api/game',
      method: "DELETE",
      data : { id: $scope.selectedGames },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getCookie("token")
      }
    })
    .then(function(response) {
      if(response.data.success){
        $scope.getGames();
        $scope.showAlert(null, "Games Deleted");
      }else{
        $scope.showAlert(null, "Error");
      }
    });
  };

  $scope.getGames();

  $scope.showConfirm = function(ev) {
    $scope.selectedGames = [];
    for(var i =0; i< $scope.games.length; i++){
      if($scope.games[i].selected){
        $scope.selectedGames.push($scope.games[i].id);
      }
    }
    if($scope.selectedGames.length==0){
      $scope.showAlert(ev, "You don't have games selected.");
      return;
    }
    var confirm = $mdDialog.confirm()
    .textContent('Do you like to remove '+$scope.selectedGames.length+' game(s)?') 
    .ariaLabel('MultiplayerTime')
    .targetEvent(ev)
    .ok('Yes')
    .cancel('No');

    $mdDialog.show(confirm).then(function() {
      $scope.deleteGames();
    });
  };

  $scope.showAlert = function(ev, text) {
    // Appending dialog to document.body to cover sidenav in docs app
    // Modal dialogs should fully cover application
    // to prevent interaction outside of dialog
    $mdDialog.show(
      $mdDialog.alert()
      .parent(angular.element(document.querySelector('#popupContainer')))
      .clickOutsideToClose(true)
      .textContent(text)
      .ariaLabel('MultiplayerTime')
      .ok('Ok')
      .targetEvent(ev)
      );
  };

});