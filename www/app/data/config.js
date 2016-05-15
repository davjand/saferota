(function () {
	'use strict';

	angular
		.module('saferota.data')
		.constant('DATA_EVENTS', {
			SYNC_START: 'SYNC_START',
			SYNC_FINISH: 'SYNC_FINISH',
			SYNC_ERROR: 'SYNC_ERROR'
		})
		.config(configureLocalForage);


	// LocalForage Init

	/* @ngInject */
	function configureLocalForage($localForageProvider) {
		$localForageProvider.config({
			name: 'saferota'
		});
	}

})();