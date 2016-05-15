(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.controller('RotaViewSettingsController', RotaViewSettingsController);

	RotaViewSettingsController.$inject = ['RotaViewService', 'Session', '$state', 'AuthService', '$ionicLoading'];

	/* @ngInject */
	function RotaViewSettingsController(RotaViewService, Session, $state, AuthService, $ionicLoading) {
		var vm = this;
		vm.rota = RotaViewService.rota;
		vm.change = RotaViewService.change;

		vm.user = Session.user;

		vm.logout = logout;


		/*
		 * 
		 * 
		 * Function Definitions
		 * 
		 * 
		 */


		/**
		 * logout
		 *
		 *
		 */
		function logout() {
			$ionicLoading.show();
			AuthService.logout().then(function () {
				$ionicLoading.hide();
				$state.go('auth.login');
			});
		}
	}

})();

