(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('RemoteAdapterInterface', RemoteAdapterInterface);

	var REQUIRED = [
		'initialize',
		'online',
		'get',
		'query',
		'save',
		'update',
		'remove'
	];


	RemoteAdapterInterface.$inject = [];

	/* @ngInject */
	function RemoteAdapterInterface() {

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
			Adapter.prototype.find = find;

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


	/**
	 * find
	 *
	 * Wraps up the query function with a few helpful
	 * bits of logic including default parameters
	 *
	 * @param Model {Model}
	 * @param options {Object}
	 *
	 * Available Options Keys
	 *
	 *  - None: Entire array is returned
	 *  - orderBy: $filter.orderBy style parameter
	 *  - filter: $filter style filtering
	 *  - limit (Defaults to 100)
	 *  - offset (Defaults to 0)
	 *
	 * @returns {$q.deferred}
	 */
	function find(Model, options) {
		options = options || {};

		//create a copy, can cause an issue with testing if not
		var filterOptions = angular.merge({}, options);
		filterOptions.limit = options.limit || 100;
		filterOptions.offset = options.offset || 0;

		return this.query(Model, filterOptions);

	}


})();

