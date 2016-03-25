(function () {
	'use strict';

	angular
		.module('saferota.data')
		.provider('DataConfig', DataConfig);

	DataConfig.$inject = [];
	/**
	 *
	 * Config Object for the data services
	 *
	 * Allows it to be configured
	 *
	 */

	/* @ngInject */
	function DataConfig() {

		/*
			Defaults
		 */
		var localProvider = 'LocalAdaptorLocalForage';
		var remoteProvider = null;

		/**
		 * SetLocal Provider
		 * @param provider {String}
		 */
		this.setLocal = function (provider) {
			localProvider = provider;
		};

		/**
		 * Set Remote Provider
		 *
		 * @param provider {String}
		 */
		this.setRemote = function (provider) {
			remoteProvider = provider;
		};


		this.$get = function () {
			return {
				local: localProvider,
				remote: remoteProvider
			};

		};
	}

})();

