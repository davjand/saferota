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
			this.$cache = {};

			//additional functions
			this._getCache = _getCache;
		}

		function _getCache(name) {
			if (typeof this.$cache[name] === 'undefined') {
				this.$cache[name] = [];
			}
			return this.$cache[name];
		}

		/**
		 *
		 * Get functionality
		 *
		 * @param Model {Model}
		 * @param id
		 * @returns {*}
		 */
		function get(Model, id) {
			var options = {filter: {}};
			options.filter[Model.getKey()] = id;

			return this.find(Model, options).then(function (data) {
				return $q.when(data.length > 0 ? data[0] : null)
			});
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
		 * @param Model
		 * @param options
		 *
		 * @return Promise
		 */
		function find(Model, options) {
			options = options || {};

			var data = this._getCache(Model.className());

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
		 * @param model {Model | []}
		 * @returns {*}
		 */
		function save(model) {
			var self = this,
				resolved = {},
				storeModel = function (m) {
					var obj = m.toObject(false);
					obj.id = _guid();
					self._getCache(m.className()).push(obj);
					return {id: obj.id};
				};

			if(angular.isArray(model)){
				resolved = [];
				angular.forEach(model, function (item) {
					resolved.push(storeModel(item));
				});
			}else{
				resolved = storeModel(model);
			}
			return _wrapInPromise(resolved);
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

			angular.forEach(this._getCache(model.className()), function (item, index) {
				if (item.id === id) {
					currentIndex = index;
				}
			});

			if(currentIndex !== null){
				this._getCache(model.className())[currentIndex] = model;
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
			var id = model.id;
			var currentIndex = null;
			angular.forEach(this._getCache(model.className()), function (item, index) {
				if (item.id === id) {
					currentIndex = index;
				}
			});
			return _wrapInPromise(this._getCache(model.className()).splice(currentIndex, 1)[0]);
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
			return $q.when(value);
		}


		/**
		 * guid
		 *
		 * Generate a Unique Identifier to use for local IDs
		 *
		 * Credit to Stack Overflow
		 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
		 *
		 * @returns {string}
		 */
		function _guid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();

		}

	}

})();

