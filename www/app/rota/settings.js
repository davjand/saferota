(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('SettingsController', SettingsController);

	SettingsController.$inject = ['Session', '$rootScope', 'AuthService', '$ionicLoading', 'APP_MSG', '$state'];

	/* @ngInject */
	function SettingsController(Session, $rootScope, AuthService, $ionicLoading, APP_MSG, $state) {
		var vm = this;

		vm.user = Session.user;

		vm.sync = sync;
		vm.refresh = refresh;
		vm.logout = logout;

		/**
		 * sync
		 *
		 * Trigger a sync
		 *
		 */
		function refresh() {
			$rootScope.$emit(APP_MSG.SYNC_FRESH);
		}
		function sync() {
			$rootScope.$emit(APP_MSG.SYNC_NOW);
		}

		/**
		 * logout
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

