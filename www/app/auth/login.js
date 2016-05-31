(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('LoginController', LoginController);

	LoginController.$inject = [
		'AuthService',
		'Loading'];

	/* @ngInject */
	function LoginController(AuthService, Loading) {
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
			
			Loading.show('Logging In');

			AuthService.login(
				vm.email,
				vm.password
			).then(function () {
			}, function (error) {
				vm.error = error;
				vm.password = '';
				loginForm.$setPristine();
				
				Loading.hide();
			});
		}
	}

})();

