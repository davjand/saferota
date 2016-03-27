(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('RemoteAdapterInterface', RemoteAdapterInterface);

	var REQUIRED = [
		'initialize',
		'get',
		'find',
		'save',
		'update',
		'remove'
	];


	RemoteAdapterInterface.$inject = ['$q'];

	/* @ngInject */
	function RemoteAdapterInterface($q) {

		return function (options) {

			var Adapter = function (config) {
				this._config = angular.merge({},config);
				this.initialize(this._config);
			};

			angular.forEach(REQUIRED, function (key) {
				if (options[key]) {
					Adapter.prototype[key] = options[key];
				} else {
					throw('Cannot create remote adapter: "' + key + '" is a required function');
				}
			});

			//add in extra helper functions
			Adapter.prototype.config = config;

			return Adapter;
		};
	}


	////////////////////////////////

	// Function Definitions

	////////////////////////////////

	/**
	 *
	 * config
	 *
	 * Shortcut for get/set functions for config
	 *
	 * @param options (optional)
	 * @returns {*}
	 */
	function config(options) {
		if (typeof options !== 'undefined') {
			return this._config;
		} else {
			return this._config = angular.merge({},options);
		}
	}


})();

