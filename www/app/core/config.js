(function () {
	'use strict';

	angular
		.module('saferota.core')
		.config(laddaConfig)
		.config(cacheConfig)
		.run(ionicRun)
		.run(apiConfig);
		

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
	function cacheConfig(CacheFactoryProvider) {
		//14 days
		angular.extend(CacheFactoryProvider.defaults, { maxAge: 14 * 24 * 60 * 60 * 1000 });
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
	
	
	// Config Backendless

	/* @ngInject */
	function apiConfig(Backendless){
		Backendless.initApp("C1C7FA38-5751-AD0D-FFB9-6A7E712C9D00",
			"827C6171-B5C1-819F-FF14-A57770892900",
			"v1");
	}


})();