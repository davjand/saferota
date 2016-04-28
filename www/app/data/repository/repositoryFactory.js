(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('Repository', Repository);

	Repository.$inject = ['DataConfig', '$injector', '$q', '$rootScope'];

	/* @ngInject */
	function Repository(DataConfig, $injector, $q, $rootScope) {


		/**
		 * Constructor
		 *
		 * Creates a repository for data models
		 *
		 * Stores local data into local storage via the localAdapter
		 * All retrieved or created models are stored in memory with simple 'ref counting'
		 * to allow angular 3-way data binding
		 *
		 * @param Model
		 * @param localAdapter {String}
		 *
		 */
		var Repository = function (Model, localAdapter) {
			/*
			 Internal variables
			 */
			this._Model = Model;

			this._ready = $q.defer();
			this._updatedAt = null;

			/*
			 Create the adapters
			 */
			this.$mem = {};

			/*
			 * create local adapter
			 *
			 * @TODO 	Do not create local adapter if this.onlineEnabled() = false.
			 * @TODO	Other elements of the repository need refactoring to achieve this
			 */
			this.$local = new ($injector.get(localAdapter || DataConfig.local))(this._Model._config);


			//init
			this._initConfig();
		};


		/*

		 External Interface

		 */
		Repository.prototype.registerModel = registerModel;
		Repository.prototype.save = save;
		Repository.prototype.sync = sync;
		Repository.prototype.remove = remove;
		Repository.prototype.get = get;
		Repository.prototype.find = find;
		Repository.prototype.notify = notify;
		Repository.prototype.clear = clear;

		Repository.prototype.updatedAt = updatedAt;

		//Internal Config
		Repository.prototype._initConfig = _initConfig;
		Repository.prototype.ready = function () {
			return this._ready.promise;
		};

		//is offline
		Repository.prototype.offlineEnabled = offlineEnabled;


		//Internal Memory Management
		Repository.prototype._inMem = _inMem;
		Repository.prototype._putMem = _putMem;
		Repository.prototype._getMem = _getMem;
		Repository.prototype._delMem = _delMem;
		Repository.prototype._regScope = _regScope;
		Repository.prototype._deregScope = _deregScope;


		return Repository;


		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		/**
		 * registerModel
		 *
		 * Registers a model internally.
		 * Does not save it to the datastore
		 *
		 * @param model
		 * @param $scope
		 */
		function registerModel(model, $scope) {
			if ($scope && !$scope.$destroy) {
				throw(    'Repository for "' +
					this._Model.className() +
					'": Invalid $scope passed to registerModel'
				);
			}
			if ($scope) {
				this._putMem(model, $scope);
			}
		}


		/**
		 * updatedAt
		 *
		 * Gets or sets when the repository was last updated (with the server)
		 * To allow differential sync
		 *
		 * @param date (Optional)
		 * @returns {Promise}
		 */
		function updatedAt(date) {
			var self = this;

			return this.ready().then(function () {
				if (typeof date === 'undefined') {
					return $q.when(self._updatedAt);
				} else {
					self._updatedAt = date;
					return self.$local.updatedAt(date);
				}
			});
		}


		/**
		 * offlineEnabled
		 *
		 * Returns true if the model is set to allow offline mode
		 * Defaults to true if the model hasn't had this property set
		 *
		 * @returns {*}
		 */
		function offlineEnabled() {
			return typeof this._Model.getConfig().offline !== 'undefined' ?
				this._Model.getConfig().offline :
				true;
		}


		/**
		 * save model(s) into the repository
		 *
		 * Save the passed models into the datastore
		 * If models exist in the datastore then load then
		 * and see which is newer.
		 * If the current model is newer, save that, otherwise keep the old changes
		 * Persist these to memory
		 * Then review the current cache and issue updates for whatever is needed
		 *
		 * @param model {Object | Array}
		 * @param $scope {$scope} (optional scope object to bind the items to if needed). Pass false if not needed
		 * @param setUpdatedDate {Boolean} - Defaults to true. Sets the model updated date
		 * @param triggerUpdateEvent {Boolean} - Defaults to false. Triggers an update on the models in memory
		 * @returns {Promise}
		 */
		function save(model, $scope, setUpdatedDate, triggerUpdateEvent) {
			setUpdatedDate = typeof setUpdatedDate !== 'undefined' ? setUpdatedDate : true;
			triggerUpdateEvent = typeof triggerUpdateEvent !== 'undefined' ? triggerUpdateEvent : false;

			var self = this,
				toSave = {};

			if (!angular.isArray(model)) {
				model = [model];
			}

			//get a list of keys of the models
			var modelIndex = {};
			angular.forEach(model, function (item) {

				//type check
				if (item.className() !== self._Model.className()) {
					throw(    'RepositoryFactory.save TypeError: Cannot save model of type: "' +
					item.className() +
					'" into repository of type: "' +
					self._Model.className() + '"');
				}

				// Add a timestamp to each model
				if (setUpdatedDate) {
					item.updatedDate = new Date(Date.now());
				}
				modelIndex[item.getKey()] = item;
			});

			/*
			 *
			 * Helper function to save to memory
			 *
			 * Returns a promise to allow promise chaining
			 */
			function saveMemory(modelsToSave) {
				/*
				 Now review all the models in memory and updated if needed
				 */
				angular.forEach(modelsToSave, function (savedModel, key) {
					if ($scope && $scope !== false) {
						self.registerModel(savedModel, $scope);
					}

					if (self._inMem(key)) {
						self._getMem(key).setData(savedModel);

						//trigger an update if specified
						if (triggerUpdateEvent) {
							self._getMem(key).emit('update');
						}
					}
				});
				return $q.when();
			}


			/*
			 * See if offline is disabled, defaults to true
			 */
			if (!self.offlineEnabled()) {
				/*
				 * If offline is set to false, then just save to memory
				 */
				return saveMemory(modelIndex)
			} else {
				/*
				 * Otherwise save to local storage first
				 */
				return self.$local.data(Object.keys(modelIndex)).then(function (data) {
					angular.forEach(modelIndex, function (modelVal, modelKey) {
						/*
						 if not found, we'll save the new one
						 */
						if (!data[modelKey] || data[modelKey] === null) {
							toSave[modelKey] = modelVal;
						}
						/*
						 If found then do a diff sync
						 */
						else {
							var localModel = self._Model.create(data[modelKey], false, true);
							if (!localModel.isEqual(modelVal)) {
								if (modelVal.updatedDate.getTime() > localModel.updatedDate.getTime()) {
									localModel.setData(modelVal.toObject());
								}
							}
							toSave[modelKey] = localModel;
						}

					});
					//save into the database
					return self.$local.data(toSave);
				}).then(function () {
					return saveMemory(toSave);
				});
			}
		}

		/**
		 * sync function
		 *
		 * Wrapper for save
		 * Saves the models then saves the updated date to the passed date
		 * Defaults to the current time if no date passed
		 *
		 * @param model {Model | Array}
		 * @param $scope {Scope} - to be passed to save function
		 * @param date {Date} (Optional)
		 * @returns {Promise}
		 */
		function sync(model, $scope, date) {
			var self = this;
			date = date || new Date(Date.now());
			return this.save(model, $scope, false, true).then(function () {
				return self.updatedAt(date);
			});
		}

		/**
		 * notify
		 *
		 * Receives a resolved transaction
		 *
		 * @param transaction
		 * @returns a promise when complete
		 */
		function notify(transaction) {

			var self = this,
				initialId = transaction.model.getKey(),
				model;

			return this.$local.data(initialId).then(function (object) {
				/*
				 create a new model from data - or from transaction

				 Has to be from the transaction to ensure data gets propogated
				 correctly if relationships are set/unset

				 */
				//model = self._Model.create(object === null ? transaction.model : object);
				model = self._Model.create(transaction.model.toObject());
				/*
				 Apply the data
				 */
				model.setData(transaction.resolveData);
				/*
				 Remove the old model
				 */
				return self.$local.remove(initialId);
			}).then(function () {
				/*
				 Save back to local storage
				 */
				return self.$local.data(model.getKey(), model.toObject());
			}).then(function () {
				if (self._inMem(initialId)) {
					/*
					 Get the model from memory
					 */
					var memObj = self.$mem[initialId];
					memObj.m.setData(model.toObject());
					/*
					 Delete the old key (not the model, exists in m
					 */
					delete self.$mem[initialId];
					/*
					 Put back into memory
					 */
					var newKey = memObj.m.getKey();
					if (self._inMem(newKey)) {
						//shouldn't exist
						throw "RepositoryFactory.notify: Resolved transaction ID already exists: " + newKey;
					}
					self.$mem[newKey] = memObj;

					memObj.m.emit('update');
				}
				return $q.when();
			})
		}


		/**
		 * remove
		 *
		 * Removes a model from the local rempository
		 *
		 * @TODO notification on this object
		 *
		 * @param model
		 * @returns {Promise}
		 */
		function remove(model) {
			//trigger event
			model.emit('delete');
			this._delMem(model);

			if (this.offlineEnabled()) {
				return this.$local.remove(model.getKey());
			} else {
				return $q.when();
			}
		}

		/**
		 * get
		 * @param id {String} - ID to retrieve
		 * @param $scope {$scope} - to bind the object to
		 * @param force {Boolean} - Forces to bypass the memory object
		 * @returns {Promise}
		 */
		function get(id, $scope, force) {
			var self = this;
			force = typeof force === 'undefined' ? false : force;

			/*
			 * In Memory
			 * Register the new scope if applicable
			 */
			if (self._inMem(id) && !force) {
				var model = this._getMem(id);
				self.registerModel(model, $scope);
				return $q.when(model);
			}

			/*
			 * If offline, don't go looking in the cache if not found
			 */
			if (!self.offlineEnabled()) {
				return $q.when(null);
			}

			/*
			 * Retrieve from cache
			 */
			return self.$local.data(id).then(function (data) {
				if (data === null) {
					return $q.when(null);
				}
				else if (self._inMem(id)) {
					/*
					 If in memory then update the object,
					 register the new scope if applicable
					 Return the object
					 */
					var model = self._getMem(id);
					model.setData(data);
					self.registerModel(model, $scope);
					return $q.when(model);

				} else {
					/*
					 Otherwise construct the object
					 */
					var retrievedModel = self._Model.create(data);
					self.registerModel(retrievedModel, $scope);
					return $q.when(retrievedModel);
				}
			});
		}

		/**
		 * find
		 *
		 * Find items in the local repository
		 *
		 * @param options - {Object} see localInterface.filter for accepted parameters
		 * @param $scope
		 * @returns {Promise}
		 */
		function find(options, $scope) {
			options = options || {};
			var data = [],
				self = this;

			if (!self.offlineEnabled()) {
				return $q.when();
			}

			return this.$local.filter(options.filter, options.orderBy).then(function (results) {
				angular.forEach(results, function (item) {
					/*
					 see if the item exists in the cache,
					 if not, create a new model
					 */
					var model = self._getMem(item[self._Model.getKey()]);
					if (model === null) {
						model = self._Model.create(item);
					}
					//register in cache if scoped
					self.registerModel(model, $scope);
					data.push(model)
				});
				return $q.when(data);
			});
		}

		/**
		 * clear
		 *
		 * clear the repository, pass true to clear the localstorage as well
		 *
		 * @param andCache {Boolean}
		 * @returns {Promise}
		 */
		function clear(andCache) {
			this.$mem = {};
			if (andCache) {
				return this.$local.clear();
			} else {
				return $q.when();
			}
		}


		////////////////////////////////

		// Internal Function Definitions

		////////////////////////////////

		/**
		 * initConfig
		 *
		 * Loads the configuration from the local provider
		 *  - Sets the update date
		 *
		 * @param reload {Boolean} - Force a reload
		 * @returns {Promise|*}
		 * @private
		 */
		function _initConfig(reload) {
			var self = this;
			if (!self._configLoaded || reload) {
				return self.$local.updatedAt().then(function (updatedAt) {
					if (updatedAt instanceof Date) {
						self._updatedAt = updatedAt;
					} else {
						self._updatedAt = null;
					}
					self._configLoaded = true;
					self._ready.resolve();
					return $q.when();
				}, _err(self._ready));
			} else {
				return $q.when();
			}
		}


		/**
		 * _err
		 *
		 * Factory function to handle promise failures
		 *
		 * Takes a promise that will be rejected with the error message
		 *
		 * Can be passed as the second parameter in a then function
		 *
		 * @param p {Promise}
		 * @returns {Function}
		 * @private
		 */
		function _err(p) {
			return function (error) {
				p.reject(error);
			}
		}

		////////////////////////////////

		/*
		 'Memory' Management Function Definitions

		 We keep an internal track of all created models as this allows us to always retrieve the same object model
		 and thus angular can propagate changes between different parts of out application

		 Models can be manually unloaded from memory but the design is for them to be automatically unloaded
		 when the scope they are in is destroyed, if that is the last copy remaining

		 */

		////////////////////////////////

		/**
		 * _modelId
		 *
		 * Accepts either a model or a model id and returns the model id
		 *
		 * @private
		 */
		function _modelId(model) {
			if (typeof(model) === 'string') {
				return model;
			}
			else if (typeof(model) === 'number') {
				return model.toString();
			} else {
				return model.getKey();
			}
		}


		/**
		 * _inMem
		 *
		 * returns true if the passed model or id is in memory
		 *
		 * @param id {Model | String}
		 * @returns {boolean}
		 * @private
		 */
		function _inMem(id) {
			return typeof this.$mem[_modelId(id)] !== 'undefined';
		}

		/**
		 * Puts a model into memory and registers the scope if doesn't exist
		 *
		 *
		 * @param model
		 * @param $scope
		 * @private
		 */
		function _putMem(model, $scope) {
			if (!this._inMem(model)) {
				this.$mem[_modelId(model)] = {
					m: model,
					c: 0,
					s: []
				};
			}
			this._regScope(model, $scope);
		}

		/**
		 * _getMem
		 *
		 * Gets a model from the internal memory
		 *
		 * @param id
		 * @private
		 */
		function _getMem(id) {
			if (this._inMem(id)) {
				return this.$mem[id].m;
			} else {
				return null;
			}
		}

		/**
		 * _delMem
		 *
		 * Emits a delete event on the model
		 *
		 * @param model
		 * @private
		 */
		function _delMem(model) {
			if (this._inMem(model)) {
				delete this.$mem[model.getKey()];
			}
		}

		/**
		 * _regScope
		 *
		 * Registers a model with the passed scope
		 * Registers a $destroy event to _deregister the scope
		 *
		 * @param model
		 * @param $scope
		 * @private
		 */
		function _regScope(model, $scope) {
			var self = this;

			if (this._inMem(model)) {

				var id = _modelId(model);

				//if no scope passed and already has a scope then stop
				if (typeof $scope === 'undefined' && self.$mem[id].c > 0) {
					return;
				}

				var found = false;
				//see if the scope has been found
				angular.forEach(this.$mem[id].s, function (s) {
					found = found || s === $scope;
				});
				if (!found) {
					$scope = $scope || $rootScope;
					this.$mem[id].c++;
					this.$mem[id].s.push($scope);

					/*
					 * Register the destroy callback
					 *
					 * We need to do this against the in memory object rather
					 * than the id primitive. Otherwise if a model is resolved
					 * and it's id updated, we will be trying to deregister the wrong
					 * model id.
					 */
					var m = this.$mem[id].m;
					$scope.$on('$destroy', function () {
						self._deregScope(_modelId(m), $scope);
					})
				}
			}
		}

		/**
		 * _deregScope
		 *
		 * Unregisters a binding to the scope
		 * If there are no more bindings for an object, the model is removed from the $mem cache
		 *
		 * @param model
		 * @param $scope
		 * @private
		 */
		function _deregScope(model, $scope) {
			var self = this;
			if (this._inMem(model)) {
				var found = -1,
					id = _modelId(model);

				angular.forEach(this.$mem[id].s, function ($s, index) {
					if ($scope === $s) {
						found = index;
					}
				});
				if (found !== -1) {
					self.$mem[id].s.splice(found, 1);
					this.$mem[id].c--;
				}
				if (this.$mem[id].c < 1) {
					delete self.$mem[id];
				}
			}
		}


	}

})();
