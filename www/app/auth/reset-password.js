(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('ResetPasswordController', ResetPasswordController);

	ResetPasswordController.$inject = ['AuthService', '$state'];

	/* @ngInject */
	function ResetPasswordController(AuthService, $state) {
		var vm = this;
		vm.email = $state.params && $state.params.email ? $state.params.email : '';
		vm.error = false;
		vm.success = false;
		vm.loading = false;

		vm.resetPassword = resetPassword;
		vm.login = function () {
			$state.go('login');
		};


		////////////////


		function resetPassword(resetPasswordForm) {

			if (!resetPasswordForm.$valid) {
				return;
			}
			vm.error = false;
			vm.success = false;
			vm.loading = true;

			AuthService.resetPassword(vm.email)
				.then(function () {
					vm.loading = false;
					vm.success = "Please check your emails";
				}, function (error) {
					vm.error = error;
					vm.loading = false;
				});
		}
	}

})();

