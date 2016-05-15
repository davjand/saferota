(function () {
	'use strict';

	var Backendless = window.Backendless;

	angular
		.module('saferota.data')
		.factory('RemoteAdapterBackendless', RemoteAdapterBackendless);

	/**
	 * RemoteAdapterBackendless
	 *
	 * A remote adapter for the Backendless Backend
	 *
	 */
	RemoteAdapterBackendless.$inject = ['RemoteAdapterInterface', '$q', 'BACKENDLESS_API'];

	/* @ngInject */
	function RemoteAdapterBackendless(RemoteAdapterInterface, $q, BACKENDLESS_API) {

		return RemoteAdapterInterface({
			initialize: initialize,
			online: online,
			get: get,
			query: query,
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
		function initialize(config) {
			var self = this;
			config = config || {};

			//init Backendless
			if (!Backendless.UserService) {
				Backendless.serverURL = BACKENDLESS_API;
				Backendless.initApp(
					config.application,
					config.secret,
					config.version
				);

			}

			//extra functions
			self._wrapPromise = _wrapPromise;
			self._getClass = _getClass;
			self._persistance = _persistance;
			self._xhr = _xhr;
			self._formatForSave = _formatForSave;
			self._processRelationships = _processRelationships;

			//only for testing expose this
			if (window.module) {
				self._bulkDelete = _bulkDelete;
			}

			self.$modelCache = [];

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
			var self = this;

			return self._wrapPromise(
				self._persistance(Model),
				'findById',
				id
			).then(function (data) {
				return $q.when(self._processRelationships(Model, data));
			});
		}

		/**
		 * query
		 *
		 * Find functionality
		 *
		 * Available Options Keys
		 *
		 *  - None: Entire array is returned
		 *  - orderBy: $filter.orderBy style parameter
		 *  - filter: $filter style filtering
		 *  - updateDate
		 *  - options: {limit, offset}
		 *
		 * @param Model
		 * @param options
		 *
		 * @return Promise
		 */
		function query(Model, options) {
			options = options || {};
			options.options = options.options || {};

			var self = this;

			var query = {
					options: {
						pageSize: options.limit || 100,
						offset: options.offset || 0
					}
				},
				conditions = [];

			/*
			 * Filter
			 */
			if (options.filter) {
				angular.forEach(options.filter, function (val, key) {
					if (!angular.isArray(val)) {
						val = [val];
					}
					/*
					 * See if the keys are relational, if so then need to become
					 * .objectId
					 */
					if (Model._rel[key]) {
						key = key + '.objectId';
					}

					var thisCond = key + ' IN(';
					for (var i = 0; i < val.length; i++) {
						thisCond = thisCond + '\'' + val[i] + '\'';
						if (i < val.length - 1) {
							thisCond = thisCond + ','
						}
					}
					thisCond = thisCond + ")";
					conditions.push(thisCond);
				});


				query.condition = conditions.join(' and ');
			}
			/*
			 * Sort
			 */
			if (options.orderBy) {
				query.options.sortBy = angular.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
			}

			/*
			 * Updated Date
			 */
			if (options.updatedDate) {
				var cond = 'updated > ' + options.updatedDate.getTime();
				if (query.condition) {
					query.condition = query.condition + " and " + cond;
				} else {
					query.condition = cond;
				}
			}


			return self._wrapPromise(
				self._persistance(Model),
				'find',
				query
			).then(function (response) {
				/*
				 * Process the data params (meta data)
				 */
				var data = [];
				angular.forEach(response.data, function (val) {
					var obj = angular.merge({}, val);
					obj.updatedDate = new Date(obj.updated);
					delete obj.updated;
					obj.createdDate = new Date(obj.created);
					delete obj.created;

					//process relationships
					obj = self._processRelationships(Model, obj);

					data.push(obj);
				});
				return $q.when({
					data: data,
					length: data.length,
					count: response.totalObjects,
					offset: response.offset,
					limit: query.options.pageSize
				});
			})
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
			var self = this;

			return self._wrapPromise(
				self._persistance(model),
				'save',
				_formatForSave(model)
			).then(function (data) {
				return $q.when(self._processRelationships(model.factory, data));
			});
		}

		/**
		 * update
		 *
		 * @param model
		 * @returns {*}
		 */
		function update(model) {
			var self = this;

			return self._wrapPromise(
				self._persistance(model),
				'save',
				_formatForSave(model)
			).then(function (data) {
				return $q.when(self._processRelationships(model.factory, data));
			});
		}

		/**
		 * remove
		 *
		 *
		 * @param model
		 * @returns {*}
		 */
		function remove(model) {
			var self = this;
			return self._wrapPromise(
				self._persistance(model),
				'remove',
				model.objectId
			);
		}


		/**
		 * online
		 *
		 * Resolves the promise if online, rejects if not
		 *
		 * @returns {*|Promise}
		 */
		function online() {
			var token = Backendless.LocalCache.get("user-token");

			if (!token) {
				return $q.reject({code: 3064});
			}

			return this._xhr('GET', 'users/isvalidusertoken/' + token).then(function (valid) {
				if(valid) {
					return $q.when();
				}else{
					Backendless.LocalCache.clear();
					return $q.reject();
				}
			}, function (error) {
				error = error || {};
				//if expired
				if (error.code === 3064) {
					Backendless.LocalCache.clear();
				}
				return $q.reject(error);
			});
		}


		/**
		 * _getClass
		 *
		 * Function that takes a DataStore Model object and gets a form
		 * accepted by Backendless. These are cached internally so the
		 * objects are only created once
		 *
		 * @param Model
		 * @returns {Object}
		 * @private
		 */
		function _getClass(Model) {
			var name = Model.className(),
				remote = this;

			if (!remote.$modelCache[name]) {

				var WrappedModel = function (data) {
					var self = this;
					angular.forEach(data, function (k, v) {
						self[k] = v || '';
					});
				};
				WrappedModel.prototype.___class = name;
				remote.$modelCache[name] = WrappedModel;
			}

			return remote.$modelCache[name];
		}

		/**
		 * Helper function to wrap the passed Backendess
		 * function into a promise structure
		 *
		 * Accepts params in the following order
		 * 1) the context
		 * 2) the function to call
		 * 3+ the parameters to pass to the function
		 *
		 * @private
		 */
		function _wrapPromise() {
			var args = arguments,
				context = arguments[0],
				fx = arguments[1],
				params = [],
				p = $q.defer();

			for (var i = 2; i < arguments.length; i++) {
				params.push(arguments[i]);
			}
			params.push(new Backendless.Async(
				function (data) {
					p.resolve(data);
				}, function (error) {
					p.reject(error);
				})
			);

			if (angular.isFunction(fx)) {
				fx.apply(context, params);
			}
			else {
				context[fx].apply(context, params);
			}


			return p.promise;
		}

		/**
		 * _persistance
		 *
		 * Returns the Backendless persistance of object from
		 * a modelFactory Model
		 *
		 * Shortcut function
		 *
		 * @param Model
		 * @returns {*}
		 * @private
		 */
		function _persistance(Model) {
			return Backendless.Persistence.of(this._getClass(Model));
		}


		/**
		 * _bulkDelete
		 *
		 * Clear out a table
		 *
		 *
		 * @param Model
		 * @returns {*}
		 * @private
		 */
		function _bulkDelete(Model) {
			/*
			 @TODO: Setup Proper E2E Testing
			 Cannot use $http as won't work in jasmine environment
			 For now we are doing integration testing in jasmine
			 */
			return this._xhr('DELETE', "data/bulk/" + Model.className() + "?where=1=1");
		}


		/**
		 * _xhr
		 *
		 * Shortcut for creating a xhr object
		 *
		 * @param method
		 * @param url
		 * @returns {*|Promise}
		 * @private
		 */
		function _xhr(method, url) {

			url = BACKENDLESS_API + "/" + this._config.version + "/" + url;

			var p = $q.defer();
			var xhr = new XMLHttpRequest();

			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4 && xhr.status == 200) {
					p.resolve(xhr.responseText === 'true');
				}
				else if (xhr.readyState == 4) {
					p.reject(xhr.xhr.responseText);
				}
			};

			xhr.open(method, url, true);
			xhr.setRequestHeader('application-id', this._config.application);
			xhr.setRequestHeader('secret-key', this._config.secret);
			xhr.setRequestHeader('application-type', 'REST');
			xhr.send();


			return p.promise;
		}

		/**
		 * _formatForSave
		 *
		 * Converts a model into a data object
		 * Processes each relationship into the following format
		 *
		 * rel: {
		 * 	___class: 'className',
		 * 	objectId: 'xxx'
		 * 
		 * }
		 *
		 * @param model
		 * @private
		 */
		function _formatForSave(model) {
			var data = model.toObject(false, false);

			angular.forEach(model._rel, function (r) {
				var d = data[r.key];

				if (d && r.keyType === model.REL_KEY_TYPES.LOCAL) {
					data[r.key] = {
						___class: r.model,
						objectId: d
					}
				}
			});
			return data;
		}

		/**
		 * _processRelationships
		 *
		 * @param Model
		 * @param data
		 * @private
		 */
		function _processRelationships(Model, data) {
			angular.forEach(Model._rel, function (rel) {
				if (rel.keyType === Model.REL_KEY_TYPES.LOCAL) {
					var k = rel.key;
					if (data[k]) {
						data[k] = data[k].objectId;
					}
				}
			});
			return data;

		}

	}

})();

