(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('SignupController', SignupController);

	SignupController.$inject = ['AuthService','$state'];

	/* @ngInject */
	function SignupController(AuthService,$state) {
		var vm = this;
		vm.name = '';
		vm.email = '';
		vm.password = '';


		vm.signup = signup;
		vm.login = function(){$state.go('login');};

		activate();

		////////////////

		function activate() {

		}

		function signup(){
			AuthService.signup(
				vm.name,
				vm.email,
				vm.password
			);
		}
	}

})();

