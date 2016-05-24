(function () {
	'use strict';

	angular
		.module('saferota.core')
		.config(laddaConfig)
		.run(ionicRun);


	/*
	 * Ionic Config
	 */

	ionicRun.$inject = ['$ionicPlatform', '$rootScope', 'UI_EVENTS'];

	/* @ngInject */
	function ionicRun($ionicPlatform, $rootScope, UI_EVENTS) {
		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				window.cordova.plugins.Keyboard.disableScroll(true);

				//allow keyboard accessory bar to be shown / hidden by events
				$rootScope.$on(UI_EVENTS.KEYBOARD_ACCESSORY_HIDE, function () {
					window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				});
				$rootScope.$on(UI_EVENTS.KEYBOARD_ACCESSORY_SHOW, function () {
					window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
				});


			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				window.StatusBar.styleLightContent();
			}


		});

	}


	/*
	 * Config Ladda
	 */
	/* @ngInject */
	function laddaConfig(laddaProvider) {
		laddaProvider.setOption({
			style: 'zoom-in',
			spinnerSize: 35,
			spinnerColor: '#ffffff'
		});
	}


})();