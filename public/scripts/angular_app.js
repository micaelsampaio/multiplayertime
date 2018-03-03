var app = angular.module('app', ['ngMaterial','ngRoute'])
.config(function ($mdThemingProvider, $mdGestureProvider) {
	$mdThemingProvider
	.theme('default')
	.primaryPalette('blue')
	.accentPalette('blue')
	.warnPalette('red')
	.backgroundPalette('grey');
	$mdGestureProvider.skipClickHijack();
})
.directive('mdUploadFile', apsUploadFile);

function apsUploadFile() {
	var directive = {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			ngModel: '='
		},
		template: '<input id="fileInput" type="file" class="ng-hide"> <md-button id="uploadButton" class="md-raised md-primary" aria-label="attach_file">    Choose file </md-button><md-input-container  md-no-float>    <input id="textInput" style="margin-top:20px" ng-model="ngModel.name" type="text" placeholder="No file chosen" ng-readonly="true"> </md-input-container> <img id="img" src="#" alt="your image" onerror="this.style.display=\'none\';" width="300" onload="this.style.display=\'block\';" />',
		link: apsUploadFileLink
	};
	return directive;
}

function apsUploadFileLink(scope, element, attrs, ngModelCtrl) {
	var input = element[0].querySelector('#fileInput');
	var button = element[0].querySelector('#uploadButton');
	var textInput = element[0].querySelector('#textInput');
	var img = element[0].querySelector('#img');

	if (input!= null && button!=null && textInput!=null) {
		
		button.addEventListener("click",function(e) {
			input.click();
		}, false);
		textInput.addEventListener("click",function(e) {
			input.click();
		}, false);
	}

	input.addEventListener('change', function(e) {
		var files = e.target.files;
		if (files[0]!=null) {			
			ngModelCtrl.$modelValue = files[0];
            scope.ngModel = files[0];

			var reader = new FileReader();

			reader.addEventListener("load", function (e) {
				img.src = e.target.result;
			}, false);

			reader.readAsDataURL(files[0]);
		} else {
			scope.fileName = null;
		}
		scope.$apply();
	}, false);
}