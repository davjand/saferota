(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('SignupController', SignupController);

	SignupController.$inject = [
		'AuthService',
		'Loading',
		'$scope',
	];

	/* @ngInject */
	function SignupController(AuthService, Loading, $scope) {
		var vm = this;
		vm.name = '';
		vm.email = '';
		vm.password = '';
		vm.error = null;
		vm.submit = false;


		vm.signup = signup;
		vm.showTerms = showTerms;

		////////////////
		
		
		/**
		 * signup
		 *
		 *
		 * @param signupForm
		 */
		function signup(signupForm) {
			vm.submit = true;
			if (!signupForm.$valid) {
				return;
			}
			vm.error = null;
			
			Loading.show('Registering');

			AuthService.signup(
				vm.name,
				vm.email,
				vm.password
			).then(function () {
			}, function (error) {
				vm.error = error;
				Loading.hide();
			});
		}
		
		/**
		 * showTerms
		 *
		 * @TODO
		 */
		function showTerms() {

		}
	}

})();

