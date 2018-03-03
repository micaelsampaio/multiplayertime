app.controller('AdminListCategoryController', function($scope, $http, $mdDialog, $location) {
  $scope.categories = [];
  $scope.selectedcategories = [];
  $scope.getCategories = function(){
    var token = getCookie("token");

    $http({
      url: '/api/category',
      method: "GET",
      headers: {
        'Authorization': getCookie("token")
      }
    })
    .then(function(response) {
      $scope.categories = response.data;
      $scope.selectedcategories = [];
    })
  };

  $scope.getCategories();

  $scope.go = function ( path ) {
    $location.path( "editcategory/" + path );
  };

  $scope.deleteCategories = function(){
    $http({
      url: '/api/category',
      method: "DELETE",
      data : { id: $scope.selectedcategories },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getCookie("token")
      }
    })
    .then(function(response) {
      if(response.data.success){
        $scope.getCategories();
        $scope.showAlert(null, "Categories Deleted");
      }else{
        $scope.showAlert(null, "Error");
      }
    });
  };

  $scope.showConfirm = function(ev) {
    $scope.selectedcategories = [];
    for(var i =0; i< $scope.categories.length; i++){
      if($scope.categories[i].selected){
        $scope.selectedcategories.push($scope.categories[i].id);
      }
    }
    if($scope.selectedcategories.length==0){
      $scope.showAlert(ev, "You don't have Categories selected.");
      return;
    }
    var confirm = $mdDialog.confirm()
    .textContent('Do you like to remove '+$scope.selectedcategories.length+' category(ies)?') 
    .ariaLabel('MultiplayerTime')
    .targetEvent(ev)
    .ok('Yes')
    .cancel('No');

    $mdDialog.show(confirm).then(function() {
      $scope.deleteCategories();
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