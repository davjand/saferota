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
		var localProvider = 'LocalAdapterMemory';
		var remoteProvider = 'RemoteAdapterMemory';
		var localConfig = {};
		var remoteConfig = {};

		/**
		 * SetLocal Provider
		 * @param provider {String}
		 * @param config {Object}
		 */
		this.setLocal = function (provider, config) {
			config = config || {};
			localProvider = provider;
			remoteConfig = angular.merge({}, config);
		};

		/**
		 * Set Remote Provider
		 *
		 * @param provider {String}
		 * @param config {Object}
		 */
		this.setRemote = function (provider, config) {
			config = config || {};
			remoteProvider = provider;
			remoteConfig = angular.merge({}, config);
		};


		this.$get = function () {
			return {
				local: localProvider,
				localConfig: localConfig,
				remote: remoteProvider,
				remoteConfig: remoteConfig
			};

		};
	}

})();

