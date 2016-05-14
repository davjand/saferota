(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('SettingsController', SettingsController);

	SettingsController.$inject = ['Session', '$rootScope', 'AuthService', '$ionicLoading', 'DATA_EVENTS', '$state'];

	/* @ngInject */
	function SettingsController(Session, $rootScope, AuthService, $ionicLoading, DATA_EVENTS, $state) {
		var vm = this;

		vm.user = Session.user;

		vm.sync = sync;
		vm.logout = logout;

		/**
		 * sync
		 *
		 * Trigger a sync
		 *
		 */
		function sync() {
			$rootScope.$emit(DATA_EVENTS.REFRESH_DATA);
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

