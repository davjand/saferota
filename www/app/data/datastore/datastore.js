(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('DataStore', DataStore);

	DataStore.$inject = ['ModelService', 'RepositoryService', 'RequestService', '$q', 'RelationshipService', 'Model'];

	/* @ngInject */
	function DataStore(ModelService, RepositoryService, RequestService, $q, RelationshipService, Model) {
		var self = this;


		//Model Functions
		self.create = create;
		self.save = save;
		self.sync = sync;
		self.syncAll = syncAll;
		self.get = get;
		self.find = find;
		self.remove = remove;
		self.registerScope = registerScope;
		self.clear = clear;
		self.clearAll = clearAll;

		//Internal
		self._decorateFactory = _decorateFactory;
		self._decorateModel = _decorateModel;

		/*
		 * Initialisation Relationships
		 */
		RelationshipService.registerDataStore(this);

		/*
		 * Create a listener to trigger a sync if goes online
		 */
		RequestService.on('goOnline', function () {
			RequestService.ready().then(function () {
				self.syncAll();
			});
		});

		/*
		 * True if currently synchronising via syncAll
		 */
		self.$syncInProgress = false;

		/*
		 * A promise to when the current sync is complete
		 * If $syncInProgress is true, otherwise just a resolved
		 * promise
		 */
		var $syncPromise = null;
		self.$syncComplete = $q.when();

		/*
		 * Decorate Model Factory and models when created
		 */
		self._decorateFactory(Model);
		Model.addDecorator(self._decorateModel);


		/////////////////////////////////////////

		// Model Function Definitions

		/////////////////////////////////////////


		/**
		 * create
		 *
		 * Create a model
		 * Injects a callback so that each object created with the model is registered to the passed scope
		 *
		 * @param name
		 * @returns {*|Model}
		 */
		function create(name) {

			var Model = ModelService.create(name, function ($scope) {
				if ($scope !== false) {
					RepositoryService.get(this).registerModel(this, $scope);
				}
			});
			RepositoryService.create(Model);

			return Model;
		}


		/**
		 * save
		 *
		 * Saves a model
		 *
		 * Supports arrays
		 *
		 * @param models
		 * @param execute
		 * @param $scope
		 * 
		 * @returns {*}
		 */
		function save(models, execute, $scope) {
			execute = typeof execute === 'undefined' ? false : execute;
			models = angular.isArray(models) ? models : [models];

			/*
			 * Recurse to call synchronously
			 */
			function fx(i) {
				if (i < models.length) {
					var model = models[i];
					var exists = model.updatedDate && model.updatedDate != null;
					return RepositoryService.get(model.className()).save(model, $scope).then(function () {
						if (model.__existsRemotely || exists) {
							return RequestService.update(model, execute);
						} else {
							return RequestService.create(model, execute);
						}
					}).then(function () {
						return fx(i + 1);
					});

				} else {
					return $q.when();
				}
			}

			return fx(0);
		}


		/**
		 * sync
		 *
		 * Downloads all the models for the given model type
		 * Requests a subset if Model._config.sync is specified
		 * Does a differential sync on updatedDate if the repo has
		 * a saved updatedDate
		 *
		 * @param Model
		 * @param options
		 * @returns {*}
		 */
		function sync(Model, options) {
			options = options || {};
			var repo = RepositoryService.get(Model);


			var modelConfig = Model.getConfig();

			/*
			 * Add in default filter settings
			 */
			if (typeof modelConfig.sync !== 'undefined') {

				/*
				 * Cancel sync if model not syncing
				 */
				if (modelConfig.sync === false) {
					return $q.when();
				}

				var syncSettings = modelConfig.sync;

				/*
				 * If a function, execute
				 */
				if (angular.isFunction(syncSettings)) {
					syncSettings = syncSettings();
				}

				/*
				 * Make into a filter object
				 */
				options.filter = options.filter || {};
				angular.merge(options.filter, syncSettings);
			}

			//ensure online
			return RequestService.goOnline().then(function () {
				/*
				 Get the updated Date
				 */
				return repo.updatedAt();
			}).then(function (updatedAt) {
				if (updatedAt !== null) {
					options.updatedAt = updatedAt;
				}
				return RequestService.findChunked(Model, options);
			}).then(function (data) {
				//save the data
				return _saveResponseDataLocally(Model, data, true);
			});
		}


		/**
		 * SyncAll
		 *
		 * Syncs all models
		 * Sets flags and a promise on the DataStore to indicate in progress
		 *
		 * @returns {*}
		 */
		function syncAll() {
			var pArr = [],
				self = this;

			if (!self.$syncInProgress) {
				/*
				 * Setup flags
				 */
				self.$syncInProgress = true;
				$syncPromise = $q.defer();
				self.$syncComplete = $syncPromise.promise;

				/*
				 * Build a promise array of all the data model parallel syncs
				 */
				angular.forEach(ModelService.getAll(), function (Model) {
					pArr.push(self.sync(Model));
				});
				/*
				 * Respond when complete
				 */
				return $q.all(pArr).then(function () {
					self.$syncInProgress = false;
					$syncPromise.resolve();
					return $q.when();
				}, function (error) {
					self.$syncInProgress = false;
					$syncPromise.reject('SyncAll Error: ' + error);
					return self.$syncComplete;
				});
			} else {
				return self.$syncComplete;
			}
		}


		/**
		 * _saveResponseDataLocally
		 *
		 * Takes data from the response service and saves
		 * it into the local repository
		 *
		 * Responsible for only updating models where the server update date is the same or newer
		 *
		 *
		 * @param Model {Object} Model Constructor
		 * @param data {Array} of objects
		 * @param [sync] {Boolean} Defaults to true.
		 *                If false will use the repo save method instead of sync
		 *                This prevents the updatedDate being set on the repo
		 * @param [$scope] - if passed, will register the objects with scope
		 * @returns {Promise} Returns a promise to the saved models
		 * @private
		 */
		function _saveResponseDataLocally(Model, data, sync, $scope) {
			$scope = $scope || false;
			sync = typeof sync !== 'undefined' ? sync : true;
			var repo = RepositoryService.get(Model);
			//construct models from them
			if (data.length > 0) {
				var models = [];
				angular.forEach(data, function (item) {
					models.push(Model.create(item, false, true));
				});
				if (sync) {
					return repo.sync(models, $scope).then(function () {
						return $q.when(models);
					});
				} else {
					return repo.save(models, $scope).then(function () {
						return $q.when(models);
					})
				}
			} else {
				//no data but still need to update the repo
				if (sync) {
					return repo.updatedAt(new Date(Date.now()));
				}
				return $q.when();
			}
		}


		/**
		 * get
		 *
		 * @param Model
		 * @param id
		 * @param $scope
		 * @param forceRemote
		 *
		 * @returns {Promise}
		 */
		function get(Model, id, $scope, forceRemote) {
			if (typeof Model === 'string') {
				Model = ModelService.get(Model);
			}

			if (typeof id === 'undefined') {
				return $q.when();
			}


			var repo = RepositoryService.get(Model);

			return self.$syncComplete.then(function () {
				return repo.updatedAt()
			}).then(function (date) {
				if (date === null || forceRemote) {
					return _getFromRemote(Model, id, $scope);
				} else {
					//get locally
					return RepositoryService.get(Model).get(id, false, $scope).then(function (model) {
						if (model !== null) {
							return $q.when(model);
						}
						return _getFromRemote(Model, id, $scope);
					});
				}
			});
		}

		/**
		 * _getFromRemote
		 *
		 * Gets a model from the requestService
		 * Saves it into the local repository
		 * Returns a promise to the model
		 *
		 * @param Model
		 * @param id
		 * @param $scope
		 * @private
		 */
		function _getFromRemote(Model, id, $scope) {
			return RequestService.get(Model, id).then(function (data) {
				return _saveResponseDataLocally(Model, [data], false, $scope);
			}).then(function (models) {
				return $q.when(models.length > 0 ? models[0] : null);
			});
		}


		/**
		 * find
		 *
		 * Simple find function to filter from the local datastore
		 *
		 * @TODO Implement direct remote fetching and synching
		 * @TODO Implement sorting
		 *
		 * @param Model
		 * @param options {Object} Expected keys .filter
		 * @param $scope
		 * @param forceRemote {Boolean}
		 * @returns {Promise}
		 */
		function find(Model, options, $scope, forceRemote) {
			if (typeof Model === 'string') {
				Model = ModelService.get(Model);
			}

			var repo = RepositoryService.get(Model);

			//ensure current sync is complete
			return self.$syncComplete.then(function () {
				return repo.updatedAt()
			}).then(function (date) {
				if (date === null || forceRemote) {
					return _findFromRemote(Model, options, $scope);
				} else {
					//get locally
					return repo.find(options, $scope).then(function (models) {
						if (models !== null) {
							return $q.when(models);
						}
						return _getFromRemote(Model, options, $scope);
					});
				}
			}, function (error) {
				return $q.reject(error);
			});
		}


		/**
		 * remove
		 *
		 * @TODO To Spec and code
		 *
		 * @param model
		 * @param options
		 *
		 * @
		 */
		function remove(model, options) {
			options = options || {};
			throw "DataStore.remove is not yet implemented";
		}


		/**
		 * registerScope
		 *
		 * Registers a new scope for a model, allowing it get stay bound
		 * and recieve updates within that scope
		 *
		 * @param m1
		 * @param $scope
		 */
		function registerScope(m1, $scope) {
			RepositoryService.get(m1.className()).registerModel(m1, $scope);
		}


		/**
		 * _findFromRemote
		 *
		 * Finds from the remote and saves into the database
		 *
		 * @param Model
		 * @param options
		 * @param $scope
		 * @returns {*}
		 * @private
		 */
		function _findFromRemote(Model, options, $scope) {
			return RequestService.find(Model, options).then(function (data) {
				return _saveResponseDataLocally(Model, data.data, false, $scope);
			}).then(function (models) {
				return $q.when(models && models.length > 0 ? models : []);
			});
		}


		/**
		 * clear
		 *
		 * Clears the data stores
		 *
		 * If no model passed, clears all
		 *
		 * @param Model
		 * @param storedData {Boolean} - clear the local caches
		 * @returns {*}
		 */
		function clear(Model, storedData) {

			if (angular.isObject(Model)) {
				//clear just the repo
				return RepositoryService.get(Model).clear(storedData);
			} else {
				//clear all
				storedData = typeof Model === 'undefined' ? false : Model;
				var p = [];
				angular.forEach(RepositoryService.getAll(), function (r) {
					p.push(r.clear(storedData));
				});
				if (p.length > 0) {
					return $q.all(p);
				} else {
					return $q.when();
				}
			}
		}

		/**
		 * clearAll
		 *
		 * Clears all local data, in memory and cached
		 *
		 * @returns {*}
		 */
		function clearAll() {
			var p = [];

			angular.forEach(RepositoryService.getAll(), function (repo) {
				p.push(repo.clear(true));
			});

			return $q.all(p)
		}


		/**
		 * _decorateFactory
		 *
		 * adds a $get, $sync, $find functions to a model factory
		 *
		 * @param Model
		 * @returns {Model}
		 * @private
		 */
		function _decorateFactory(ModelFactory) {
			var getArgs = function (that, args) {
				var a = Array.prototype.slice.call(args);
				a.unshift(that);
				return a;
			};

			/*
			 * Ideally we'd bind to prototype but this is quicker
			 */
			ModelFactory.prototype.$get = function () {
				return self.get.apply(self, getArgs(this, arguments));
			};
			ModelFactory.prototype.$find = function () {
				return self.find.apply(self, getArgs(this, arguments));
			};
			ModelFactory.prototype.$sync = function () {
				return self.sync.apply(self, getArgs(this, arguments));
			};
		}

		/**
		 * _decorateModel
		 *
		 * Decorates a model constructor with $save and $remove
		 *
		 * @param ModelConstructor
		 * @private
		 */
		function _decorateModel(ModelConstructor) {
			var getArgs = function (that, args) {
				var a = Array.prototype.slice.call(args);
				a.unshift(that);
				return a;
			};

			ModelConstructor.prototype.$save = function () {
				return self.save.apply(self, getArgs(this, arguments));
			};
			ModelConstructor.prototype.$remove = function () {
				return self.remove.apply(self, getArgs(this, arguments));
			};
			ModelConstructor.prototype.$register = function () {
				return self.registerScope.apply(self, getArgs(this, arguments));
			};
		}



	}
})
();

