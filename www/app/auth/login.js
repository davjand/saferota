(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('LoginController', LoginController);

	LoginController.$inject = [
		'AuthService',
		'$ionicLoading'];

	/* @ngInject */
	function LoginController(AuthService, $ionicLoading) {
		var vm = this;

		vm.email = '';
		vm.password = '';
		vm.error = false;

		vm.login = login;


		////////////////


		/**
		 * login
		 *
		 * Validates the form and then tries to login
		 *
		 *
		 * @param loginForm
		 */
		function login(loginForm) {

			if (!loginForm.$valid) {
				return;
			}
			vm.error = null;

			$ionicLoading.show();

			AuthService.login(
				vm.email,
				vm.password
			).then(function () {
			}, function (error) {
				vm.error = error;
				vm.password = '';
				loginForm.$setPristine();

				$ionicLoading.hide();
			});
		}
	}

})();

