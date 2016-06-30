(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.service('DevicePermissions', DevicePermissions);
	
	DevicePermissions.$inject = [
		'$ionicModal',
		'$window',
		'$q',
		'$log',
		'$rootScope',
		'$ionicPopup',
		'$ionicPlatform',
		'$timeout'
	];
	
	/* @ngInject */
	function DevicePermissions($ionicModal,
							   $window,
							   $q,
							   $log,
							   $rootScope,
							   $ionicPopup,
							   $ionicPlatform,
							   $timeout) {
		
		var self = this,
			$api = null,
			$apiEnabled = false;
		
		
		self.checkAndShowError = checkAndShowError;
		self.getLocationPermissions = getLocationPermissions;
		self.displayPermissionErrorModal = displayPermissionErrorModal;
		self.apiIsEnabled = apiIsEnabled;
		self.api = api;
		self.openSettings = openSettings;
		self.activate = activate;
		
		
		////////////////
		
		$ionicPlatform.ready(function () {
			self.activate();
		});

		
		/**
		 * activate
		 *
		 */
		function activate() {
			if ($window.cordova &&
				$window.cordova.plugins &&
				$window.cordova.plugins.diagnostic) {
				
				$api = $window.cordova.plugins.diagnostic;
				$apiEnabled = true;
			} else {
				$apiEnabled = false;
			}
		}
		
		/**
		 * apiIsEnabled
		 *
		 * @returns {boolean}
		 */
		function apiIsEnabled() {
			return $apiEnabled;
		}
		
		/**
		 * api
		 *
		 * @returns {Object}
		 */
		function api() {
			return $api || {};
		}
		
		/**
		 * openSettings
		 */
		function openSettings() {
			if ($window.cordova &&
				$window.cordova.plugins &&
				$window.cordova.plugins.settings) {
				$window.cordova.plugins.settings.open();
			}
		}
		
		
		/**
		 * checkAndShowError
		 *
		 */
		function checkAndShowError() {
			self.getLocationPermissions().then(function (result) {
				if (result === false) {
					self.displayPermissionErrorModal();
				}
			});
		}
		
		
		/**
		 * displayPermissionErrorModal
		 *
		 *
		 */
		function displayPermissionErrorModal() {
			var scope = $rootScope.$new(true),
				modal = null,
				recheckPermissionsScheduled = false;
			
			scope.openSettings = self.openSettings;
			scope.recheckPermissions = function (hideAlert) {
				self.getLocationPermissions().then(function (result) {
					if (result) {
						if (modal) {
							modal.remove();
							modal = null;
							recheckPermissionsScheduled = false;
						}
					} else if (hideAlert !== true) {
						$ionicPopup.alert({
							title:    'Permissions not Granted',
							subTitle: 'SafeRota still does not location permissions, please enable in your device settings',
							okText:   'Close',
							okType:   'button-energized'
						});
					}
					if (!result && !recheckPermissionsScheduled) {
						//recheck in 3 seconds time
						recheckPermissionsScheduled = $timeout(function () {
							recheckPermissionsScheduled = false;
							scope.recheckPermissions(true)
						}, 3000);
					}

				})
			};
			
			if (!modal) {
				modal = $ionicModal.fromTemplateUrl('app/core/services/devicePermissions/permissionError.html', {
					scope:                   scope,
					hardwareBackButtonClose: false
				}).then(function (result) {
					modal = result;
					modal.show();
					
					//recheck in 3 seconds time
					$timeout(function () {
						scope.recheckPermissions(true)
					}, 3000);
				});
			}
			
		}
		
		
		/**
		 * getLocationPermissions
		 *
		 * See if has location permissions
		 *
		 * @returns {*} Promise to true/false
		 */
		function getLocationPermissions() {
			if (!$apiEnabled) {
				return $q.when(true);
			}
			var p = $q.defer();
			
			$api.isLocationEnabled(function (result) {
				p.resolve(result);
			}, function (error) {
				$log.log(error);
				p.resolve(false);
			});
			
			return p.promise;
		}
		
	}
	
})();

