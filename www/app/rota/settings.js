(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('SettingsController', SettingsController);

	SettingsController.$inject = [
		'Session',
		'$rootScope',
		'$scope',
		'AuthService',
		'$ionicLoading',
		'$ionicHistory',
		'$ionicPopup',
		'TourService',
		'RotaGeoFenceService',
		'APP_MSG',
		'$state'
	];

	/* @ngInject */
	function SettingsController(Session,
								$rootScope,
								$scope,
								AuthService,
								$ionicLoading,
								$ionicHistory,
								$ionicPopup,
								TourService,
								RotaGeoFenceService,
								APP_MSG,
								$state) {
		var vm = this;

		vm.user = Session.user;

		vm.sync = sync;
		vm.refresh = refresh;
		vm.logout = logout;
		vm.playTour = playTour;
		vm.deactivateAll = deactivateAll;

		/**
		 * refresh
		 *
		 * Trigger a complete resync
		 *
		 */
		function refresh() {
			_createConfirm('Are you sure you wish to refresh all data?', function () {
				$rootScope.$emit(APP_MSG.SYNC_FRESH);
			});
		}

		/**
		 * sync
		 *
		 * Trigger a diff sync
		 *
		 */
		function sync() {
			$rootScope.$emit(APP_MSG.SYNC_NOW);
		}

		/**
		 * logout
		 *
		 * @param hide {Function} The function to hide the modal
		 */
		function logout(hide) {
			_createConfirm('Are you sure you wish to logout?', function () {
				$ionicLoading.show();
				AuthService.logout().then(function () {
					$ionicLoading.hide();

					$ionicHistory.nextViewOptions({disableAnimate: true, historyRoot: true});
					$state.go('auth.login');
					if (hide) {
						hide();
					}
				});
			});
		}


		/**
		 * _createConfirm
		 *
		 * Helper function to create a confirm dialog and then
		 * execute a callback of the 'confirm' button is clicked
		 *
		 * @param title
		 * @param callback
		 * @private
		 */
		function _createConfirm(title, callback) {
			$ionicPopup.confirm({
				title: title,
				okType: 'button-assertive button-outline'
			}).then(function (ok) {
				if (ok) {
					callback();
				}
			});
		}


		/**
		 * playTour
		 *
		 */
		function playTour() {
			TourService.show();
		}

		/**
		 * deactivateAll
		 *
		 * Deactivates all geofences
		 *
		 */
		function deactivateAll() {
			$ionicLoading.show();
			RotaGeoFenceService.deactivateAll()
				.then(function () {
					$ionicLoading.hide();
				})
		}


	}

})();

