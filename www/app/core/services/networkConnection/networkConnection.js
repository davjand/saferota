(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.constant('NETWORK_MSG', {
			ONLINE:  '$cordovaNetwork:online',
			OFFLINE: '$cordovaNetwork:offline'
		})
		.service('NetworkConnection', NetworkConnection);
	
	NetworkConnection.$inject = ['$cordovaNetwork', '$window'];
	
	/* @ngInject */
	function NetworkConnection($cordovaNetwork, $window) {
		var self = this;
		
		self.isOnline = isOnline;
		self.isOffline = isOffline;
		
		
		/**
		 * check to see if isOnline
		 *
		 * @returns {*}
		 */
		function isOnline() {
			if ($window.ionic.Platform.isWebView()) {
				return $cordovaNetwork.isOnline();
			} else {
				return navigator.onLine;
			}
		}
		
		/**
		 * check to see if Offline
		 * @returns {boolean}
		 */
		function isOffline() {
			return !self.isOnline();
		}
	}
	
})();

