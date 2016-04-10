(function () {
	'use strict';

	/*

	 Local Interface Factory

	 Function to allow creation of local interfaces

	 Example Implementation below

	 return LocalAdapterInterface({
	 initialize: initialize,
	 get: getData,
	 set: setData,
	 keys: keys
	 remove: remove,
	 getConfig: getConfig,
	 setConfig: setConfig,
	 filter: filter,
	 length: length,
	 clear: clear,
	 });

	 function initialize(options){
	 options = options || {};
	 }


	 */


	angular
		.module('saferota.data')
		.factory('LocalAdapterInterface', LocalAdapterInterface);

	var REQUIRED = [
		'initialize',
		'getConfig',
		'setConfig',
		'keys',
		'get',
		'set',
		'length',
		'clear',
		'iterate',
		'remove',
		'clearAll'
	];

	LocalAdapterInterface.$inject = ['$q'];

	/* @ngInject */
	function LocalAdapterInterface($q) {

		return function (options) {

			/*
			 Create the Adapter Interface Object

			 Constructor
			 - Creates a new copy of the config object
			 - Calls the initialize function (provided by implementation)
			 - Creates this.ready which is a promise that resovles when the config has been initialized

			 */
			var Adapter = function (config) {
				this._ready = $q.defer(); //class should decide when ready

				var conf = angular.merge({}, config);
				this.initialize(conf);
			};

			angular.forEach(REQUIRED, function (key) {
				if (options[key]) {
					Adapter.prototype[key] = options[key];
				} else {
					throw('Cannot create local adapter: "' + key + '" is a required function');
				}
			});


			//add in extra helper functions
			Adapter.prototype.data = data;
			Adapter.prototype.config = config;
			Adapter.prototype.updatedAt = updatedAt;
			Adapter.prototype.configKey = configKey;
			Adapter.prototype.isReady = function () {
				return this._ready.promise;
			};

			//filter functions
			Adapter.prototype.filter = filter;

			/*
			 Helper function to reject promises
			 */
			Adapter.prototype._err = function (p) {
				return function (error) {
					p.reject(error);
				}
			};

			//set static method
			Adapter.clearAll = options['clearAll'];

			return Adapter;
		};


		////////////////////////////////

		// Function Definitions

		////////////////////////////////


		/**
		 * configKey
		 *
		 * If passed key and value, sets the config key to the value
		 * If passed only a key, returns the key
		 *
		 * @param key
		 * @param value
		 * @return {Promise|*}
		 */
		function configKey(key, value) {
			var self = this;
			var p = $q.defer();

			self.config().then(function (conf) {
				//get the key
				if (typeof value === 'undefined') {
					p.resolve(conf[key]);

				} else {
					//set the key
					conf[key] = value;
					self.config(conf).then(function () {
						p.resolve();
					});
				}
			});

			return p.promise;
		}


		/**
		 * updatedAt
		 *
		 * Gets / Sets the updatedAt Date in the config
		 *
		 * @param date
		 * @returns {Promise|*}
		 */
		function updatedAt(date) {
			var p = $q.defer();

			if (typeof date !== 'undefined') {
				this.configKey('updatedAt', date).then(function () {
					p.resolve();
				})
			} else {
				this.configKey('updatedAt').then(function (val) {
					if (typeof val === 'string') {
						p.resolve(new Date(val));
					} else {
						p.resolve(val);
					}
				});
			}

			return p.promise;
		}


		/**
		 *
		 * data
		 *
		 * Shortcut for get/set functions
		 *
		 * Behaviour
		 * data(key) = Gets the value for the key
		 * data({key: value,key2...} Sets multiple items
		 * data([]) Returns multiple keys
		 *
		 * @param key
		 * @param value (optional) - if set then acts as a setter
		 * @returns {*}
		 */
		function data(key, value) {
			var pArr = [];

			if (angular.isArray(key)) {
				/*
				 Return multiple keys
				 */
				var p = $q.defer();
				var found = {};


				//Loop through the keys and create an array of promises
				angular.forEach(key, function (k) {
					pArr.push(this.get(k));
				}, this);

				//Process the promises and merge the two arrays
				$q.all(pArr).then(function (promiseData) {
					angular.forEach(key, function (k, index) {
						if (promiseData[index] && promiseData[index] !== null) {
							found[k] = promiseData[index];
						}
						else {
							found[k] = null;
						}
					});
					p.resolve(found);
				});

				return p.promise;
			} else if (angular.isObject(key)) {
				/*
				 Set multiple keys
				 */
				angular.forEach(key, function (v, k) {
					pArr.push(this.set(k, v));
				}, this);
				//Combine into one promise
				return $q.all(pArr);

			} else if (typeof value !== 'undefined') {
				/*
				 Simple Set
				 */
				return this.set(key, value)
			} else {
				/*
				 Simple Get
				 */
				return this.get(key);
			}
		}

		/**
		 * filter
		 *
		 * Uses the iterator function to filter the objects
		 *
		 * Supports the following specialist keys
		 *
		 * $logic = AND \ OR
		 * $this - to allow filtering of the whole object (ie if just a string)
		 *
		 * @param filter
		 *
		 * @returns {Promise}
		 */
		function filter(filter) {

			//if nothing then just return
			if (!filter) {
				return this.iterate(function () {
					return true;
				});
			}

			var $$OR = 'OR', $$AND = ' AND';

			//shortcuts
			if (typeof filter === 'string') {
				filter = {$this: filter};
			}
			if (typeof filter.$logic === 'undefined') {
				filter.$logic = $$AND;
			}

			return this.iterate(function (value, currentKey) {
				var matches = filter.$logic === $$AND; //start as true if an AND, false if OR
				currentKey = currentKey || true;

				if (filter.$this) {
					matches = filter.$this === value;
				} else {

					angular.forEach(filter, function (filterVal, filterKey) {

						if (filterKey !== '$this' && filterKey !== '$logic') {

							/*
							 Preprocess filterValue into arrays
							 */
							if (!angular.isArray(filterVal)) {
								filterVal = [filterVal];
							}
							/*
							 Preprocess the value to be filtered into a array
							 */
							var objValue = value[filterKey],
								found = false;

							if (typeof objValue === 'undefined') {
								if (filter.$logic === $$AND) {
									matches = false;
								}
							} else {
								if (!angular.isArray(objValue)) {
									objValue = [objValue];
								}
								//array intersection
								angular.forEach(objValue, function (o) {
									found = found || filterVal.indexOf(o) != -1;
								});

								//Apply logic type
								if (filter.$logic === $$OR) {
									matches = matches || found;
								} else {
									matches = matches && found;
								}
							}
						}

					});
				}
				if (matches) {
					return currentKey;
				}
			});


			/*var data = {};

			 if(callback) {
			 angular.forEach(this.$cache, function (value, key) {
			 if (callback.call(this, value, key)) {
			 data[key] = value;
			 }
			 });
			 }else{
			 data = this.$cache;
			 }
			 return _wrapInPromise(data);*/

		}


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
				return this.setConfig(options)
			} else {
				return this.getConfig(options);
			}
		}
	}

})();

