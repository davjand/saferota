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
			this._configLoaded = false;
			this._updatedAt = null;
			this._isFresh = false;


			/*
			 Create the adapters
			 */
			this.$mem = {};
			this.$local = new ($injector.get(localAdapter || DataConfig.local))(this._Model._config);

		};


		//External Interface
		Repository.prototype.registerModel = registerModel;
		Repository.prototype.save = save;
		Repository.prototype.remove = remove;
		Repository.prototype.get = get;
		Repository.prototype.find = find;
		Repository.prototype.notify = notify;

		Repository.prototype.clear = clear;

		//Internal Methods - expose for testing
		Repository.prototype._initConfig = _initConfig;
		Repository.prototype.ready = function () {
			return this._ready.promise;
		};


		//Internal
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
			this._putMem(model, $scope)
		}


		/**
		 * save a model into the repository
		 *
		 *
		 * @param model
		 * @param $scope {$scope} (optional scope object to bind the items to if needed)
		 */
		function save(model, $scope) {
			var self = this,
				toSave = {};

			if (!angular.isArray(model)) {
				model = [model];
			}
			angular.forEach(model, function (item) {
				//register the models
				if (!self._inMem(item)) {
					self.registerModel(item, $scope)
				}
				toSave[item.id] = item.toObject();
			});

			return this.$local.data(toSave);
		}

		/**
		 * notify
		 *
		 * Receives a resolved transaction
		 *
		 * @param transaction
		 */
		function notify(transaction) {

		}

		function remove(model) {

		}

		/**
		 * get
		 * @param id {String} - ID to retrieve
		 * @param force {Boolean} -
		 * @param $scope {$scope} - to bind the object to
		 * @returns {Promise}
		 */
		function get(id, force, $scope) {
			var self = this;
			force = typeof force === 'undefined' ? false : force;

			/*
			 In Memory
			 Register the new scope if applicable
			 */
			if (self._inMem(id) && !force) {
				var model = this._getMem(id);
				if ($scope) {
					self.registerModel(model, $scope);
				}
				return $q.when(model);
			}

			/*
			 Retrieve from cache
			 */
			return self.$local.data(id).then(function (data) {
				if (self._inMem(id)) {
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


		function find(options) {

		}

		function clear() {
			this.$mem = {};
		}


		////////////////////////////////

		// Internal Function Definitions

		////////////////////////////////

		/**
		 * initConfig
		 *
		 * Loads the configuration from the local provider
		 *  - Sets the update date
		 *  - Sets _isFresh to true if no config
		 *
		 * @returns {Promise|*}
		 * @private
		 */
		function _initConfig() {
			var self = this;
			if (!self._configLoaded) {
				self.$local.updatedAt().then(function (updatedAt) {
					if (updatedAt instanceof Date) {
						self._updatedAt = updatedAt;
						self._isFresh = false;
					} else {
						self._isFresh = true;
					}
					self._configLoaded = true;
					self._ready.resolve();
				}, _err(self._ready));
			}
			return self._ready.promise;
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
			$scope = $scope || $rootScope;

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
		 * @returns {*}
		 * @private
		 */
		function _getMem(id) {
			if (this._inMem(id)) {
				return this.$mem[id].m;
			} else {
				return null;
			}
		}

		function _delMem(model) {

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
				var found = false,
					id = _modelId(model.getKey());
				angular.forEach(this.$mem[id].s, function (s) {
					found = found || s === $scope;
				});
				if (!found) {
					this.$mem[id].c++;
					this.$mem[id].s.push($scope);

					//register the callback
					$scope.$on('$destroy', function () {
						self._deregScope(id, $scope);
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
