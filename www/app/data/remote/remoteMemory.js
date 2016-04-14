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
			online: online,
			get: get,
			find: find,
			save: save,
			update: update,
			remove: remove
		});

		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		/**
		 * initialize
		 *
		 * Constructor
		 *
		 */
		function initialize() {

			this.$cache = {};
			this.$online = true;

			//additional functions
			this._getCache = _getCache;
			this._setOnline = _setOnline;


		}

		/**
		 * _getCache
		 *
		 * get a cache or create if doesn't exist
		 *
		 * @param name
		 * @returns {*}
		 * @private
		 */
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
				var foundData = [];

				/*
				 Loop through models
				 */
				angular.forEach(data, function (model) {
					var match = true;
					/*
					 Loop through filters
					 */
					angular.forEach(options.filter, function (filterVal, filterKey) {
						var matchFilter = false;
						/*
						 Match multiple vals
						 */
						angular.forEach(
							angular.isArray(filterVal) ? filterVal : [filterVal],
							function (f) {
								matchFilter = matchFilter || model[filterKey] == f;
							});
						match = match && matchFilter;
					});
					if (match) {
						foundData.push(model);
					}
				});
				data = foundData;
				//data = $filter('filter')(data, options.filter);
			}
			if (typeof options.orderBy !== 'undefined') {
				data = $filter('orderBy')(data, options.orderBy);
			}
			return $q.when(data);
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
					return {id: obj.id, updatedDate: new Date()};
				};

			if (angular.isArray(model)) {
				resolved = [];
				angular.forEach(model, function (item) {
					resolved.push(storeModel(item));
				});
			} else {
				resolved = storeModel(model);
			}
			return $q.when(resolved);
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

			if (currentIndex !== null) {
				this._getCache(model.className())[currentIndex] = model;
			}

			return $q.when(model);

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
			return $q.when(this._getCache(model.className()).splice(currentIndex, 1)[0]);
		}


		/**
		 * online
		 *
		 * Resolves the promise if online, rejects if not
		 *
		 * @returns {*|Promise}
		 */
		function online() {
			var p = $q.defer();
			p[this.$online ? 'resolve' : 'reject']();
			return p.promise;
		}

		/**
		 * _setOnline
		 *
		 * Set the online status for testing
		 *
		 * @param online
		 * @private
		 */
		function _setOnline(online) {
			this.$online = online;
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

