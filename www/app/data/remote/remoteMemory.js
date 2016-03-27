(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('RemoteAdapterMemory', RemoteAdapterMemory);

	/**
	 * RemoteAdapterMemory
	 *
	 * A Remote Adapter that stores data in memory
	 * Designed for testing purposes only
	 * Data can be pushed into the cache using the this.$cache object
	 *
	 * The standard remote functions then serve to access this data via promises
	 *
	 */
	RemoteAdapterMemory.$inject = ['RemoteAdapterInterface', '$q', '$filter'];

	/* @ngInject */
	function RemoteAdapterMemory(RemoteAdapterInterface, $q, $filter) {

		return RemoteAdapterInterface({
			initialize: initialize,
			get: get,
			find: find,
			save: save,
			update: update,
			remove: remove
		});

		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		function initialize() {
			this.$cache = [];
		}

		/**
		 *
		 * Get functionality
		 *
		 * @param id
		 * @returns {*}
		 */
		function get(id) {
			var p = $q.defer();

			this.find({filter: {id: id}}).then(function (data) {
				if (data.length > 0) {
					p.resolve(data[0]);
				} else {
					p.reject();
				}
			}, function () {
				p.reject();
			});

			return p.promise;
		}

		/**
		 * find
		 *
		 * Find functionality
		 *
		 * Available Options Keys
		 *
		 *  - None: Entire array is returned
		 *  - orderBy: $filter.orderBy style parameter
		 *  - filter: $filter style filtering
		 *
		 * @param options
		 *
		 * @return Promise
		 */
		function find(options) {
			var data = this.$cache;

			if (typeof options.filter !== 'undefined') {
				data = $filter('filter')(data, options.filter);
			}
			if (typeof options.orderBy !== 'undefined') {
				data = $filter('orderBy')(data, options.orderBy);
			}
			return _wrapInPromise(data);
		}

		/**
		 * Save data to the array
		 *
		 * Can be passed an array
		 * 
		 * @param model {Model | Array(Model)}
		 * @returns {*}
		 */
		function save(model) {
			if(angular.isArray(model)){
				this.$cache = this.$cache.concat(this.$cache,model);
			}else{
				this.$cache.push(model);
			}
			return _wrapInPromise(model);
		}

		/**
		 * update
		 *
		 * @param model
		 * @returns {*}
		 */
		function update(model) {
			var id = model.getKey();
			var currentIndex = null;

			angular.forEach(this.$cache,function(item,index){
				if(item.getKey() === id){
					currentIndex = index;
				}
			});

			if(currentIndex !== null){
				this.$cache[currentIndex] = model;
			}

			return _wrapInPromise(model);

		}

		/**
		 * remove
		 *
		 *
		 * @param model
		 * @returns {*}
		 */
		function remove(model) {
			var id = model.getKey();
			var currentIndex = null;
			angular.forEach(this.$cache,function(item,index){
				if(item.getKey() === id){
					currentIndex = index;
				}
			});
			return _wrapInPromise(this.$cache.splice(currentIndex,1)[0]);
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
		function _wrapInPromise(value) {
			var p = $q.defer();
			p.resolve(value);
			return p.promise;
		}

	}

})();

