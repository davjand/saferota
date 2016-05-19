(function () {
	'use strict';

	angular
		.module('saferota.backendless')
		//.constant('BACKENDLESS_API', "http://localhost:8100/api") //testing
		.constant('BACKENDLESS_API', "https://api.backendless.com") //live
		.constant('Backendless', Backendless)
		.config(dataConfig);


	/*
	 * Config Backendless
	 */

	/* @ngInject */
	/*
	 * Configure Data Service
	 */
	dataConfig.$inject = ['DataConfigProvider', 'BACKENDLESS_API', '$windowProvider'];

	function dataConfig(DataConfigProvider, BACKENDLESS_API, $windowProvider) {

		var $window = $windowProvider.$get();

		/*
		 *
		 * if not unit testing
		 *
		 * @TODO Might be a better way of achieving this
		 *
		 */
		if (!$window.module) {
			//configure backendless
			var APP = 'C1C7FA38-5751-AD0D-FFB9-6A7E712C9D00',
				SECRET = '827C6171-B5C1-819F-FF14-A57770892900',
				VERSION = 'v1';

			/*
			 * Init if not already initialized
			 */
			if (!Backendless.UserService) {
				Backendless.serverURL = BACKENDLESS_API;
				Backendless.initApp(
					APP,
					SECRET,
					VERSION
				);

			}

			DataConfigProvider.setLocal('LocalAdapterLocalForage');
			DataConfigProvider.setRemote('RemoteAdapterBackendless', {
				application: APP,
				secret: SECRET,
				version: VERSION
			});
		}
	}

})();