app.controller('AdminController', function($scope, $timeout, $mdSidenav, $log) {
  $scope.toggleLeft = buildDelayedToggler('left');
  $scope.toggleRight = buildToggler('right');

  $scope.selectedCategory = null;
  $scope.selectedGame = null;

  $scope.toolbar_title = "Admin Panel";

  function debounce(func, wait, context) {
    var timer;

    return function debounced() {
      var context = $scope,
      args = Array.prototype.slice.call(arguments);
      $timeout.cancel(timer);
      timer = $timeout(function() {
        timer = undefined;
        func.apply(context, args);
      }, wait || 10);
    };
  }
  function buildDelayedToggler(navID) {
    return debounce(function() {
      $mdSidenav(navID)
      .toggle()
      .then(function () {
        $log.debug("toggle " + navID + " is done");
      });
    }, 200);
  }

  function buildToggler(navID) {
    return function() {
      $mdSidenav(navID)
      .toggle()
      .then(function () {
        $log.debug("toggle " + navID + " is done");
      });
    };
  }
})
.controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function () {
    $mdSidenav('left').close()
    .then(function () {
      $log.debug("close LEFT is done");
    });

  };
}).config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl : '/admin/home.html'
  })
  .when('/listcategory', {
    templateUrl : '/admin/listcategory.html',
    controller: 'AdminListCategoryController'
  })
  .when('/addcategory', {
    templateUrl : '/admin/addcategory.html',
    controller : 'AdminCategoryController' 
  })
  .when('/editcategory/:ID', {
    templateUrl : '/admin/addcategory.html',
    controller : 'AdminCategoryController' 
  })
  .when('/game', {
    templateUrl : '/admin/addgame.html',
    controller : 'AdminAddGameController'
  })
  .when('/game/:ID', {
    templateUrl : '/admin/addgame.html',
    controller : 'AdminAddGameController' 
  })
  .when('/listgames', {
    templateUrl : '/admin/listgames.html',
    controller : 'AdminListGamesController'
  });


  
});