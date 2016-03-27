(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('LocalAdapterLocalForage', LocalAdapterLocalForage);

	LocalAdapterLocalForage.$inject = ['$localForage', 'LocalAdapterInterface', '$q'];

	//allow all to be cleared easily
	var allCaches = [];
	var PREFIX = 'data_';
	var CONFIG_KEY = "__config";


	/* @ngInject */
	function LocalAdapterLocalForage($localForage, LocalAdapterInterface, $q) {

		return LocalAdapterInterface({
			initialize: initialize,
			get: getData,
			set: setData,
			getConfig: getConfig,
			setConfig: setConfig,
			length: length,
			filter: filter,
			clear: clear,
			clearAll: clearAll,
			remove: remove
		});


		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		function initialize(options) {
			options = options || {};
			if (!options.name) {
				throw('Cache name is required');
			}

			this._cacheName = name;
			this.$cache = $localForage.createInstance({
				name: PREFIX + this._cacheName
			});

			//keep a record of all objects
			allCaches.push(this.$cache);
		}

		/**
		 * setData
		 *
		 * @param key
		 * @param val
		 * @returns {*}
		 */
		function setData(key, val) {
			return this.$cache.setItem(key, val);
		}

		/**
		 *
		 * getData
		 *
		 * @param key
		 * @returns {*}
		 */
		function getData(key) {
			return this.$cache.getItem(key);
		}

		/**
		 *
		 * getConfig
		 *
		 * @returns {*}
		 */
		function getConfig(){
			return this.$cache.getItem(CONFIG_KEY);
		}

		/**
		 *
		 * setConfig
		 *
		 * @param config
		 * @returns {*|boolean}
		 */
		function setConfig(config){
			return this.$cache.setItem(CONFIG_KEY,config);
		}


		/**
		 * length
		 *
		 * @returns {*}
		 */
		function length() {
			var p = $q.defer();

			this.$cache.length().then(function(value){
				p.resolve(value - 1); //factor in config length
			},function(error){
				p.reject(error);
			});


			return p.promise;
		}

		/**
		 * each
		 *
		 * @param callback
		 * @returns {*}
		 */
		function filter(callback) {
			//return this.$cache.iterate(callback);
		}

		/**
		 *
		 * Clear the current cache
		 *
		 * @returns {*}
		 */
		function clear() {
			return this.$cache.clear();
		}

		/**
		 *
		 * clearAll
		 *
		 * Clears all created caches by this provider
		 *
		 */
		function clearAll() {
			angular.forEach(allCaches, function (item) {
				item.clear();
			});
		}

		/**
		 * Remove an item from the store
		 *
		 *
		 * @param id
		 */
		function remove(id){
			return this.$cache.remove(id);
		}
	}

})();

