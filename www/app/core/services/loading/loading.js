(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.service('Loading', Loading);
	
	Loading.$inject = ['$ionicLoading', '$rootScope'];
	
	/* @ngInject */
	function Loading($ionicLoading, $rootScope) {
		var self = this,
			scope = $rootScope.$new(true);
		
		
		/*
		 * Interface
		 *
		 * Offers a similar interface to $ionicLoading except with the ability
		 * to add a message and change the message during loading
		 *
		 */
		self.show = show;
		self.hide = $ionicLoading.hide;
		self.message = message;
		
		
		/**
		 * message
		 *
		 * @param message
		 */
		function message(message) {
			scope.message = message;
		}
		
		/**
		 * show
		 *
		 * @param message {String} - Optional
		 */
		function show(message) {
			message = message || null;
			scope.message = message;
			
			$ionicLoading.show({
				scope: scope
			});
		}
		
		
	}
	
})();

