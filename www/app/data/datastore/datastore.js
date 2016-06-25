(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('DataStore', DataStore);

	DataStore.$inject = [
		'ModelService',
		'RepositoryService',
		'RequestService',
		'$q',
		'$log',
		'$rootScope',
		'$timeout',
		'RelationshipService',
		'DATA_EVENTS',
		'Model'];

	/* @ngInject */
	function DataStore(ModelService,
					   RepositoryService,
					   RequestService,
					   $q,
					   $log,
					   $rootScope,
					   $timeout,
					   RelationshipService,
					   DATA_EVENTS,
					   Model) {
		var self = this;


		//Model Functions
		self.create = create;
		self.save = save;
		self.sync = sync;
		self.syncAll = syncAll;
		self.startSync = startSync;
		self.stopSync = stopSync;

		self.get = get;
		self.find = find;
		self.remove = remove;
		self.registerScope = registerScope;
		self.deregisterScope = deregisterScope;
		self.clear = clear;
		self.clearAll = clearAll;

		self.interceptor = interceptor;

		//Internal
		self._decorateFactory = _decorateFactory;
		self._decorateModel = _decorateModel;


		//Settings


		/*
		 * Always look in the local data stores for objects
		 * If Set to true, we will not going looking remotely for any data
		 * 
		 * useful for testing purposes as don't need to do a sync
		 */
		self.$alwaysSearchLocal = false;


		/*
		 * Initialisation of Relationships
		 */
		RelationshipService.registerDataStore(this);

		/*
		 * Create a listener to trigger a sync if goes online
		 *
		 * Delay the sync so that it doesn't interfere
		 *
		 */
		RequestService.on('goOnline', function (firstTime) {
			if (!firstTime) {
				$timeout(function () {
					RequestService.ready().then(function () {
						self.syncAll();
					});
				}, 1000);
			}
		});

		/*
		 * True if currently synchronising via syncAll
		 */
		self.$syncInProgress = false;
		self.$syncScheduled = null;

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
			return RequestService.goOnline(true).then(function () {
				/*
				 Get the updated Date
				 */
				return repo.updatedAt();
			}).then(function (updatedAt) {
				if (updatedAt !== null) {
					options.updatedDate = updatedAt;
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
				$rootScope.$emit(DATA_EVENTS.SYNC_START);
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
					$rootScope.$emit(DATA_EVENTS.SYNC_FINISH);
					return $q.when();
				}, function (error) {
					self.$syncInProgress = false;
					$rootScope.$emit(DATA_EVENTS.SYNC_ERROR);
					$log.log(error);
					$syncPromise.reject('SyncAll Error: ' + JSON.stringify(error || {}));
					return self.$syncComplete;
				});
			} else {
				return self.$syncComplete;
			}
		}


		/**
		 * startSync
		 * 
		 * Starts a regular synchronisation to the server
		 * Every 3 minutes by default
		 * 
		 * @param immediate
		 * @param interval
		 */
		function startSync(immediate, interval){
			interval = interval || 1000 * 60 * 3; //every 3 minutes
			immediate = typeof immediate !== 'undefined' ? immediate : false;

			var _scheduleSync = function(){
				return $timeout(function(){
					self.syncAll().then(function(){
						self.$syncScheduled = _scheduleSync();
					},function(error){
						$log.log(error);
						self.$syncScheduled = _scheduleSync();
					});
				},interval);
			};

			if(self.$syncScheduled === null){
				RequestService.$disableBackgroundQueueProcessing = false;
				self.$syncScheduled = _scheduleSync();
			}

			if(immediate){
				self.syncAll();
			}

		}

		/**
		 * stopSync
		 * 
		 * Stops the regular synchronisation to the server
		 * 
		 */
		function stopSync(){
			if(self.$syncScheduled !== null){
				RequestService.$disableBackgroundQueueProcessing = true;
				$timeout.cancel(self.$syncScheduled);
				self.$syncScheduled = false;
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
					return repo.save(models, $scope, false).then(function () {
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
				if ((date === null || forceRemote) && !self.$alwaysSearchLocal) {
					return _getFromRemote(Model, id, $scope);
				} else {
					//get locally
					return RepositoryService.get(Model).get(id, false, $scope).then(function (model) {
						if (model !== null || self.$alwaysSearchLocal) {
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
				if ((date === null || forceRemote ) && !self.$alwaysSearchLocal) {
					return _findFromRemote(Model, options, $scope);
				} else {
					//get locally
					return repo.find(options, $scope).then(function (models) {
						if (models !== null || self.$alwaysSearchLocal) {
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
		 * @param model {Model|Array}
		 * @param $scope
		 *
		 * @return {Model|Array} The passed objects
		 */
		function registerScope(model, $scope) {
			var wasPassedArray = angular.isArray(model);
			
			model = wasPassedArray ? model : [model];
			angular.forEach(model, function (m) {
				RepositoryService.get(m.className()).registerModel(m, $scope);
			});
			if (!wasPassedArray) {
				return model[0];
			}
			return model;
		}

		/**
		 * deregisterScope
		 *
		 * Opposite of registerScope, using repo.deregisterModel funciton
		 *
		 * @param model
		 * @param $scope
		 */
		function deregisterScope(model, $scope) {
			model = angular.isArray(model) ? model : [model];
			angular.forEach(model, function (m) {
				RepositoryService.get(m.className()).deregisterModel(m, $scope);
			});
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

			//clear any cached transactions
			p.push(RequestService.$queue.clear());

			return $q.all(p)
		}

		/**
		 * interceptor
		 *
		 * facade for RequestService.interceptor
		 *
		 * @param interceptor {Function}
		 * @param type {String} Optional
		 */
		function interceptor(interceptor, type) {
			RequestService.interceptor(interceptor, type);
		}


		/**
		 * _decorateFactory
		 *
		 * adds a $get, $sync, $find functions to a model factory
		 *
		 * @param ModelFactory
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
			ModelConstructor.prototype.$deregister = function () {
				return self.deregisterScope.apply(self, getArgs(this, arguments));
			};
		}


	}
})
();

