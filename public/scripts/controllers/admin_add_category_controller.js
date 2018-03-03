app.controller('AdminCategoryController', function($scope, $http, $routeParams) {
  $scope.id = $routeParams.ID;
  $scope.edit = $scope.id == undefined ? false : true;
  $scope.category = {name:"", description:"", color: "#000"};

  $scope.title = !$scope.edit ? "New Category" : "Edit Category";
  $scope.btText = !$scope.edit ? "ADD Category" : " Save Category";

  $scope.resetCategory = function(){
    $scope.category.name = "";
    $scope.category.description = "";
    $scope.category.color = "#000";
  };

  $scope.addCategory = function(){
    var token = getCookie("token");

    $http({
      url: '/api/category',
      method: "POST",
      data : $scope.category,
      headers: {
        'Authorization': getCookie("token")
      }
    })
    .then(function(response) {
      console.log(response.data);
      alert(response.data);
    })
  };

  $scope.editCategory = function(){
    var token = getCookie("token");

    $http({
      url: '/api/category/'+$scope.id,
      method: "PUT",
      data : $scope.category,
      headers: {
        'Authorization': getCookie("token")
      }
    })
    .then(function(response) {
      console.log(response.data);
      alert(response.data);
    })
  };

  $scope.getCategory = function(){
    var token = getCookie("token");

    $http({
      url: '/api/category/'+$scope.id,
      method: "GET",
      headers: {
        'Authorization': getCookie("token")
      }
    })
    .then(function(response) {
      $scope.category = response.data;
    })
  };

  $scope.save = function(){
      if($scope.edit){
        $scope.editCategory();
      }else{
        $scope.addCategory();
      }
  }

  $scope.resetCategory();

  if($scope.edit){
    $scope.getCategory();
  }

});