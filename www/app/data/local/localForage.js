(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('LocalAdaptorLocalForage', LocalAdaptorLocalForage);

	LocalAdaptorLocalForage.$inject = ['$localForage'];

	//allow all to be cleared easily
	var allCaches = [];
	var PREFIX = 'data_';


	/* @ngInject */
	function LocalAdaptorLocalForage($localForage) {
		
		var adaptor = function(name){
			if(!name){
				throw('Cache name is required');
			}

			this._cacheName = name;
			this.$cache = $localForage.createInstance({
				name: PREFIX + this._cacheName
			});

			//keep a record of all objects
			allCaches.push(this.$cache);
		};


		//methods
		adaptor.prototype.getData = getData;
		adaptor.prototype.setData = setData;
		adaptor.prototype.length = length;
		adaptor.prototype.clear = clear;
		adaptor.prototype.each = each;
		
		//globally available function
		adaptor.clearAll = clearAll;

		
		return adaptor;
		

		////////////////////////////////

		// Function Definitions
		
		////////////////////////////////


		function setData(key,val){
			return this.$cache.setItem(key,val);
		}

		function getData(key){
			return this.$cache.getItem(key);
		}

		function length(){
			return this.$cache.length();
		}

		function each(callback){
			return this.$cache.iterate(callback);
		}



		/**
		 *
		 * Clear the current cache
		 *
		 * @returns {*}
		 */
		function clear(){
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
	}

})();

