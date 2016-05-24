(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('LocalAdapterLocalForage', LocalAdapterLocalForage);

	LocalAdapterLocalForage.$inject = ['$localForage', 'LocalAdapterInterface', '$q', '$log'];

	//allow all to be cleared easily
	var allCaches = [];
	var PREFIX = 'data_';
	var CONFIG_KEY = "_config";


	/* @ngInject */
	function LocalAdapterLocalForage($localForage, LocalAdapterInterface, $q, $log) {

		return LocalAdapterInterface({
			initialize: initialize,
			get: getData,
			set: setData,
			keys: keys,
			getConfig: getConfig,
			setConfig: setConfig,
			length: length,
			iterate: iterate,
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
			self.$cache.getItem(CONFIG_KEY).then(function (config) {
				if (angular.isObject(config)) {
					return $q.when();
				} else {
					return self.$cache.setItem(CONFIG_KEY, {});
				}
			}).then(function () {
				self._ready.resolve();
			}, function (error) {
				$log(error);
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
			var self = this;
			return self.isReady().then(function () {
				return self.$cache.setItem(CONFIG_KEY, config);
			});
		}


		/**
		 * length
		 *
		 * @returns {*}
		 */
		function length() {
			var self = this;

			return self.isReady().then(function () {
				return self.$cache.length();
			}).then(function (value) {
				return $q.when(value - 1); //factor in config length
			});
		}

		/**
		 * iterate
		 *
		 * @param callback
		 * @returns {*}
		 */
		function iterate(callback) {
			var data = [];
			return this.$cache.iterate(function (value, key) {
				if (key !== CONFIG_KEY) {
					if (callback(value, key)) {
						data.push(value);
					}
				}
			}).then(function () {
				return $q.when(data);
			})
		}

		/**
		 * keys
		 *
		 * Returns {}
		 */
		function keys() {
			var self = this;

			return self.isReady().then(function () {
				return self.$cache.keys();
			}).then(function (keys) {
				//remove the config key from the array
				keys.splice(keys.indexOf(CONFIG_KEY), 1);
				return $q.when(keys);
			});
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
			var arr = [];
			angular.forEach(allCaches, function (item) {
				arr.push(item.clear());
			});
			return $q.all(arr);
		}

		/**
		 * Remove an item from the store
		 *
		 *
		 * @param id
		 */
		function remove(id) {
			var self = this;
			return self.isReady().then(function () {
				return self.$cache.removeItem(id);
			});
		}
	}

})();

