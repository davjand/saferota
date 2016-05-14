(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('LoginController', LoginController);

	LoginController.$inject = ['AuthService', '$state'];

	/* @ngInject */
	function LoginController(AuthService, $state) {
		var vm = this;
		vm.email = '';
		vm.password = '';
		vm.error = false;
		vm.loading = false;

		vm.login = login;
		vm.signup = function () {
			$state.go('signup');
		};
		vm.resetPassword = function () {
			$state.go('resetPassword',{email: vm.email});
		};


		////////////////


		function login(loginForm) {

			if (!loginForm.$valid) {
				return;
			}
			vm.error = null;
			vm.loading = true;

			AuthService.login(
				vm.email,
				vm.password
			).then(function () {
				vm.loading = false;
				$state.go('app.list');
			}, function (error) {
				vm.error = error;
				vm.password = '';
				vm.loading = false;
				loginForm.$setPristine();
			});
		}
	}

})();

