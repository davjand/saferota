(function () {
	'use strict';

	angular
		.module('saferota.core')
		.config(laddaConfig)
		.run(ionicRun)
		.run(dataConfig);


	/*
	 * Ionic Config
	 */

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


	/*
	 * Config Ladda
	 */
	/* @ngInject */
	function laddaConfig(laddaProvider){
		laddaProvider.setOption({
			style: 'zoom-in',
			spinnerSize: 35,
			spinnerColor: '#ffffff'
		});
	}


	/*
	 * Configure Data Service
	 */
	function dataConfig(DataConfigProvider) {
		DataConfigProvider.setLocal('LocalAdapterLocalForage');
		DataConfigProvider.setRemote('RemoteAdapterBackendless');
	}


})();