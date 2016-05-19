(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.controller('RotaViewSettingsController', RotaViewSettingsController);

	RotaViewSettingsController.$inject = [
		'RotaViewService',
		'Session',
		'$state',
		'AuthService',
		'$ionicLoading',
		'$ionicHistory',
		'$ionicPopup'];

	/* @ngInject */
	function RotaViewSettingsController(RotaViewService,
										Session,
										$state,
										AuthService,
										$ionicLoading,
										$ionicHistory,
										$ionicPopup) {
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
			$ionicPopup.confirm({
				title: 'Are you sure you wish to logout?',
				okType: 'button-assertive button-outline'
			}).then(function (ok) {
				if (ok) {
					$ionicLoading.show();
					AuthService.logout().then(function () {
						$ionicLoading.hide();
						$ionicHistory.nextViewOptions({disableAnimate: true, historyRoot: true});
						$state.go('auth.login');
					});
				}
			});


		}
	}

})();

