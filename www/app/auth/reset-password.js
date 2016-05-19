(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.controller('ResetPasswordController', ResetPasswordController);

	ResetPasswordController.$inject = ['AuthService', '$stateParams', '$ionicLoading'];

	/* @ngInject */
	function ResetPasswordController(AuthService, $stateParams, $ionicLoading) {
		var vm = this;
		vm.email = $stateParams.email ? $stateParams.email : '';
		vm.error = false;
		vm.success = false;
		vm.loading = false;

		vm.resetPassword = resetPassword;


		////////////////


		/**
		 * resetPassword
		 *
		 *
		 * @param resetPasswordForm
		 */
		function resetPassword(resetPasswordForm) {

			if (!resetPasswordForm.$valid) {
				return;
			}
			vm.error = false;
			vm.success = false;

			$ionicLoading.show();

			AuthService.resetPassword(vm.email)
				.then(function () {
					vm.success = "Password Reset: Please check your emails";
					$ionicLoading.hide();
				}, function (error) {
					vm.error = error;
					$ionicLoading.hide();
				});
		}
	}

})();

