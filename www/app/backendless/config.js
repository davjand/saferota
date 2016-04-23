(function () {
	'use strict';

	angular
		.module('saferota.backendless')
		.constant('Backendless', Backendless)
		.run(apiConfig);


	/*
	 * Config Backendless
	 */

	/* @ngInject */
	function apiConfig(Backendless) {
		Backendless.initApp("C1C7FA38-5751-AD0D-FFB9-6A7E712C9D00",
			"827C6171-B5C1-819F-FF14-A57770892900",
			"v1");
	}

})();