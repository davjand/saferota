(function () {
	'use strict';

	angular
		.module('saferota.data')
		.config(configureLocalForage);


	// LocalForage Init

	/* @ngInject */
	function configureLocalForage($localForageProvider) {
		$localForageProvider.config({
			name        : 'saferota'
		});
	}
	
	/* @ngInject */
	function configureData(DataConfigProvider){
		//DataConfigProvider.setLocal('LocalAdapterLocalForage');
	}

})();