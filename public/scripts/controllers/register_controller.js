app.controller('RegisterController', function($scope, $http) {
	$scope.user = {username: "", password:"", email:"", contry:""};
	$scope.confirmPassword= "";

	$scope.timerEmail = null;

	angular.element(document).ready(function () {
		$scope.temp = $scope.password;
		$scope.password= $scope.temp;
	});

	$scope.validateLength = function(){
		return true;
	}
	$scope.register = function(){
		$http({
			url: '/api/user',
			method: "POST",
			data : $scope.user
		})
		.then(function(response) {			
			if(response.data.success){
				alert("Success");

				window.location.href="/";
			}else{
				alert("username or password wrong!");
			}
		},
		function(response){
			alert("Error");
		});
	}
});

var compareTo = function() {
	return {
		require: "ngModel",
		scope: {
			otherModelValue: "=compareTo"
		},
		link: function(scope, element, attributes, ngModel) {

			ngModel.$validators.compareTo = function(modelValue) {
				return modelValue == scope.otherModelValue;
			};

			scope.$watch("otherModelValue", function() {
				ngModel.$validate();
			});
		}
	};
};

function passwordVerify() {
	return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, elem, attrs, ngModel) {
        if (!ngModel) return; // do nothing if no ng-model

        // watch own value and re-validate on change
        scope.$watch(attrs.ngModel, function() {
        	validate();
        });

        // observe the other value and re-validate on change
        attrs.$observe('passwordVerify', function(val) {
        	validate();
        });

        var validate = function() {
          // values
          var val1 = ngModel.$viewValue;
          var val2 = attrs.passwordVerify;

          // set validity
          ngModel.$setValidity('passwordVerify', val1 === val2);
      };
  }
}
}
app.directive('passwordVerify', passwordVerify);

app.directive('checkUsername', ['$http',function($http) {
	return {
		restrict: 'A', 
		require: '?ngModel', 
		link: function(scope, elem, attrs, ngModel) {
			if (!ngModel) return;

			scope.$watch(attrs.ngModel, function() {
				validate();
			});

			attrs.$observe('checkUsername', function(val) {
				validate();
			});

			var timer = null;
			var validate = function() {
				if(ngModel.$viewValue.length == undefined){
					ngModel.$viewValue ="";
					clearTimeout(timer);
					return;
				}
				if(ngModel.$viewValue.length <= 0 ){
					clearTimeout(timer);
					return;
				}
				
				clearTimeout(timer);
				timer = setTimeout(function(){
					if(ngModel.$viewValue.length > 0){
						$http({
							url: '/api/user/username/'+ngModel.$viewValue,
							method: "GET"
						})
						.then(function(response) {

							console.log("validate");
							ngModel.$setValidity('checkUsername', response.data.success);
						},
						function(response){
							ngModel.$setValidity('checkUsername', false);
						});
					}
				}, 500);
			};
		}
	}
}]);

app.directive('checkEmail', ['$http',function($http) {
	return {
		restrict: 'A', 
		require: '?ngModel', 
		link: function(scope, elem, attrs, ngModel) {
			if (!ngModel) return;

			scope.$watch(attrs.ngModel, function() {
				validate();
			});

			attrs.$observe('checkUsername', function(val) {
				validate();
			});

			var timer = null;
			var validate = function() {
				if(ngModel.$viewValue.length == undefined){
					ngModel.$viewValue ="";
					clearTimeout(timer);
					return;
				}
				if(ngModel.$viewValue.length <= 0 ){
					clearTimeout(timer);
					return;
				}
				
				clearTimeout(timer);
				timer = setTimeout(function(){
					if(ngModel.$viewValue.length > 0){

						$http({
							url: '/api/user/email/'+ngModel.$viewValue,
							method: "GET"
						})
						.then(function(response) {			
							ngModel.$setValidity('checkEmail', response.data.success);
						},
						function(response){
							ngModel.$setValidity('checkEmail', false);
						});
					}
				}, 500);
			};
		}
	}
}]);