(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('LoginController', LoginController);

	LoginController.$inject = ['AuthService','$state'];

	/* @ngInject */
	function LoginController(AuthService,$state) {
		var vm = this;
		vm.email = '';
		vm.password = '';

		vm.login = login;
		vm.signup = function(){$state.go('signup');};
		vm.resetPassword = function(){$state.go('reset-password');};

		activate();

		////////////////

		function activate() {

		}

		function login(){
			AuthService.login(
				vm.email,
				vm.password
			);
		}
	}

})();

