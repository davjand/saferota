(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.service('DevicePermissions', DevicePermissions);
	
	DevicePermissions.$inject = ['$ionicModal', '$window', '$q', '$log', '$rootScope', '$ionicPopup'];
	
	/* @ngInject */
	function DevicePermissions($ionicModal, $window, $q, $log, $rootScope, $ionicPopup) {
		
		var self = this,
			$api = null,
			$apiEnabled = false;
		
		
		self.checkAndShowError = checkAndShowError;
		self.getLocationPermissions = getLocationPermissions;
		self.displayPermissionErrorModal = displayPermissionErrorModal;
		self.apiIsEnabled = apiIsEnabled;
		self.api = api;
		self.activate = activate;
		
		
		////////////////
		
		
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
				modal = null;
			
			scope.recheckPermissions = function () {
				self.getLocationPermissions().then(function (result) {
					if (result) {
						modal.remove();
					} else {
						$ionicPopup.alert({
							title:    'Permissions not Granted',
							subTitle: 'SafeRota still does not location permissions, please enable in your device settings',
							okText:   'Close',
							okType:   'button-energized'
						});
					}
				})
			};
			
			modal = $ionicModal.fromTemplateUrl('app/core/services/devicePermissions/permissionError.html', {
				scope:                   scope,
				hardwareBackButtonClose: false
			}).then(function (result) {
				modal = result;
				modal.show();
			});
			
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

