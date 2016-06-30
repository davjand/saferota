(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('SettingsController', SettingsController);

	SettingsController.$inject = [
		'Session',
		'$rootScope',
		'AuthService',
		'Loading',
		'$ionicHistory',
		'$ionicPopup',
		'TourService',
		'RotaGeoFenceService',
		'APP_MSG',
		'$state',
		'$cordovaEmailComposer',
		'TermsService'
	];

	/* @ngInject */
	function SettingsController(Session,
								$rootScope,
								AuthService,
								Loading,
								$ionicHistory,
								$ionicPopup,
								TourService,
								RotaGeoFenceService,
								APP_MSG,
								$state,
								$cordovaEmailComposer,
								TermsService) {
		var vm = this;

		vm.user = Session.user;

		vm.sync = sync;
		vm.refresh = refresh;
		vm.logout = logout;
		vm.playTour = playTour;
		vm.support = support;
		vm.showTerms = showTerms;
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
				Loading.show();
				AuthService.logout().then(function () {
					Loading.hide();

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
				title:  title,
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
		 * support
		 */
		function support() {
			$cordovaEmailComposer.isAvailable().then(function () {
				$cordovaEmailComposer.open({
					to:      'info@saferota.com',
					subject: 'SafeRota Support Request',
					body:    "Please help me, the issues I'm having are: \n\n"
				});
			}, function () {
				$ionicPopup.alert({
					title: 'Please email info@saferota.com'
				});
			});
		}
		
		/**
		 * show the terms and conditions
		 *
		 */
		function showTerms() {
			TermsService.show();
		}

		/**
		 * deactivateAll
		 *
		 * Deactivates all geofences
		 *
		 */
		function deactivateAll() {
			Loading.show();
			RotaGeoFenceService.deactivateAll()
				.then(function () {
					Loading.hide();
				})
		}


	}

})();

