(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('SignupController', SignupController);

	SignupController.$inject = [
		'AuthService',
		'$ionicLoading'
	];

	/* @ngInject */
	function SignupController(AuthService, $ionicLoading) {
		var vm = this;
		vm.name = '';
		vm.email = '';
		vm.password = '';
		vm.error = null;
		vm.terms = false;
		vm.submit = false;


		vm.signup = signup;

		////////////////


		function signup(signupForm) {
			vm.submit = true;
			if (!vm.terms || !signupForm.$valid) {
				return;
			}
			vm.error = null;

			$ionicLoading.show();

			AuthService.signup(
				vm.name,
				vm.email,
				vm.password
			).then(function () {
			}, function (error) {
				vm.error = error;
				$ionicLoading.hide();
			});
		}
	}

})();

