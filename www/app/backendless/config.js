(function () {
	'use strict';

	angular
		.module('saferota.backendless')
		.constant('Backendless', Backendless)
		.config(dataConfig);


	/*
	 * Config Backendless
	 */

	/* @ngInject */
	/*
	 * Configure Data Service
	 */
	function dataConfig(DataConfigProvider) {

		//configure backendless
		var APP = 'C1C7FA38-5751-AD0D-FFB9-6A7E712C9D00',
			SECRET = '827C6171-B5C1-819F-FF14-A57770892900',
			VERSION = 'v1';

		/*
		 * Init if not already initialized
		 */
		if (!Backendless.UserService) {
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

})();