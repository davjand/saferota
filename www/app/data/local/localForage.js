(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('LocalAdapterLocalForage', LocalAdapterLocalForage);

	LocalAdapterLocalForage.$inject = ['$localForage', 'LocalAdapterInterface', '$q'];

	//allow all to be cleared easily
	var allCaches = [];
	var PREFIX = 'data_';
	var CONFIG_KEY = "_config";


	/* @ngInject */
	function LocalAdapterLocalForage($localForage, LocalAdapterInterface, $q) {

		return LocalAdapterInterface({
			initialize: initialize,
			get: getData,
			set: setData,
			keys: keys,
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
			var self = this;

			if (!options.name) {
				throw('Cache name is required');
			}

			this._cacheName = options.name;
			this.$cache = $localForage.createInstance({
				name: PREFIX + this._cacheName
			});

			//keep a record of all objects
			allCaches.push(this.$cache);

			//init the config
			self.$cache.getItem(CONFIG_KEY).then(function(config){
				if(angular.isObject(config)){
					return $q.when();
				}else{
					return self.$cache.setItem(CONFIG_KEY,{});
				}
			}).then(function(){
				self._ready.resolve();
			})
		}

		/**
		 * setData
		 *
		 * @param key
		 * @param val
		 * @returns {*}
		 */
		function setData(key, val) {
			var p = $q.defer();
			var self = this;
			self.isReady().then(function () {
				return self.$cache.setItem(key, val);
			}).then(function () {
				p.resolve();
			}, self._err);

			return p.promise;
		}

		/**
		 *
		 * getData
		 *
		 * @param key
		 * @returns {*}
		 */
		function getData(key) {
			var p = $q.defer();
			var self = this;

			self.isReady().then(function () {
				return self.$cache.getItem(key);
			}).then(function (value) {
				p.resolve(value);
			}, self._err(p));

			return p.promise;
		}

		/**
		 *
		 * getConfig
		 *
		 * creates a new config object if needed
		 *
		 * @returns {*}
		 */
		function getConfig() {
			var p = $q.defer();
			var self = this;

			self.isReady().then(function () {
				return self.$cache.getItem(CONFIG_KEY);
			}).then(function (value) {
				p.resolve(value);
			}, self._err(p));

			return p.promise;
		}

		/**
		 *
		 * setConfig
		 *
		 * @param config
		 * @returns {*|boolean}
		 */
		function setConfig(config) {
			var p = $q.defer();
			var self = this;

			self.isReady().then(function () {
				return self.$cache.setItem(CONFIG_KEY, config);
			}).then(function () {
				p.resolve();
			}, self._err(p));

			return p.promise;
		}


		/**
		 * length
		 *
		 * @returns {*}
		 */
		function length() {
			var p = $q.defer();
			var self = this;

			self.isReady().then(function () {
					return self.$cache.length();
				})
				.then(function (value) {
					p.resolve(value - 1); //factor in config length
				}, self._err(p));

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
		 * keys
		 *
		 * Returns {}
		 */
		function keys() {
			var p = $q.defer();
			var self = this;

			self.isReady().then(function () {
				return self.$cache.keys();
			}).then(function (keys) {
				//remove the config key from the array
				keys.splice(keys.indexOf(CONFIG_KEY), 1);
				p.resolve(keys);
			}, self._err(p));

			return p.promise;
		}

		/**
		 *
		 * Clear the current cache
		 *
		 * @returns {*}
		 */
		function clear() {
			var p = $q.defer();
			var self = this;
			self.isReady().then(function () {
				return self.$cache.clear();
			}).then(function () {
				p.resolve();
			}, self._err(p));

			return p.promise;


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
		function remove(id) {
			var p = $q.defer();
			var self = this;
			self.isReady().then(function () {
				return self.$cache.removeItem(id);
			}).then(function () {
				p.resolve();
			}, self._err(p));

			return p.promise;
		}
	}

})();
