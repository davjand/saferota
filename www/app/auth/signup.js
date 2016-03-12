(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('SignupController', SignupController);

	SignupController.$inject = ['AuthService', '$state'];

	/* @ngInject */
	function SignupController(AuthService, $state) {
		var vm = this;
		vm.name = '';
		vm.email = '';
		vm.password = '';
		vm.error = null;
		vm.terms = false;
		vm.submit = false;
		vm.loading = false;


		vm.signup = signup;
		vm.login = function () {
			$state.go('login');
		};

		////////////////


		function signup(signupForm) {
			vm.submit = true;
			if (!vm.terms || !signupForm.$valid) {
				return;
			}
			vm.error = null;
			vm.loading = true;

			AuthService.signup(
				vm.name,
				vm.email,
				vm.password
			).then(function () {
				vm.loading = false;
			}, function (error) {
				//vm.loading = false;
				vm.error = error;
				vm.loading = false;
			});
		}
	}

})();

