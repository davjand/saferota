(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('LocalAdapterMemory', LocalAdapterMemory);

	LocalAdapterMemory.$inject = ['LocalAdapterInterface','$q'];

	/* @ngInject */
	function LocalAdapterMemory(LocalAdapterInterface,$q) {

		return LocalAdapterInterface({
			initialize: initialize,
			get: getData,
			set: setData,
			getConfig: getConfig,
			setConfig: setConfig,
			length: length,
			filter: filter,
			clear: clear,
			remove: remove,
			clearAll: clearAll
		});

		
		////////////////////////////////

		// Function Definitions
		
		////////////////////////////////

		function initialize(options){
			
			this.$cache = {};
			this.$config = {};
		}

		/**
		 * setData
		 *
		 * @param key
		 * @param val
		 * @returns {*}
		 */
		function setData(key,val){
			this.$cache[key] = val;
			return _wrapInPromise();
		}

		/**
		 *
		 * getData
		 *
		 * @param key
		 * @returns {*}
		 */
		function getData(key){
			return _wrapInPromise(this.$cache[key]);
		}


		/**
		 *
		 * getConfig
		 *
		 * @returns {*}
		 */
		function getConfig(){
			return _wrapInPromise(this.$config);
		}

		/**
		 *
		 * setConfig
		 *
		 * @param config
		 * @returns {*}
		 */
		function setConfig(config){
			this.$config = config;
			return _wrapInPromise();
		}

		/**
		 * length
		 *
		 * @returns {*}
		 */
		function length(){
			return _wrapInPromise(Object.keys(this.$cache).length);
		}

		/**
		 * filter
		 *
		 * @param callback
		 * @returns {*}
		 */
		function filter(callback){
			var data = {};

			angular.forEach(this.$cache,function(value,key){
				if(callback.call(this,value,key)){
					data[key] = value;
				}
			});
			return _wrapInPromise(data);
		}

		/**
		 *
		 * Clear the current cache
		 *
		 * @returns {*}
		 */
		function clear(){
			this.$cache = [];
			return _wrapInPromise();
		}


		/**
		 * ClearAll function
		 *
		 * Placeholder as no real function in this type
		 *
		 */
		function clearAll(){}

		/**
		 *
		 * remove
		 *
		 * removes an item from the array
		 *
		 */
		function remove(key) {
			var item = this.$cache[key];
			delete this.$cache[key];
			return _wrapInPromise(item);
		}


		/**
		 *
		 * _wrapInPromise
		 *
		 * Function to return a value in a promise. As the memory store is essentially
		 * a mocked object, return promises as the specification requires.
		 *
		 * @private
		 */
		function _wrapInPromise(value){
			var p = $q.defer();
			p.resolve(value);
			return p.promise;
		}
		
	}
})();

