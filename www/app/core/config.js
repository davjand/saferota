(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(runBlock)
		.config(config);


	/* @ngInject */
	function runBlock($ionicPlatform) {
		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				window.cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				window.StatusBar.styleDefault();
			}
		});

	}

	/* @ngInject */
	function config($urlRouterProvider) {

		// if none of the above states are matched, use this as the fallback

	}
})();