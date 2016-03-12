(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(ionicRun)
		.config(routeConfig)
		.config(laddaConfig);

	// Ionic Config

	/* @ngInject */
	function ionicRun($ionicPlatform) {
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

	// Config Routes


	/* @ngInject */
	function routeConfig($urlRouterProvider) {

		// if none of the above states are matched, use this as the fallback
	}


	// Config Ladda


	/* @ngInject */
	function laddaConfig(laddaProvider){
		laddaProvider.setOption({
			style: 'zoom-in',
			spinnerSize: 35,
			spinnerColor: '#ffffff'
		});
	}


})();