(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('DataStore', DataStore);

	DataStore.$inject = ['ModelService', 'RepositoryService', 'RequestService', '$q'];

	/* @ngInject */
	function DataStore(ModelService, RepositoryService, RequestService, $q) {
		var self = this;

		//Module Definition
		self.create = create;
		self.save = save;
		self.sync = sync;
		self.get = get;
		self.find = find;
		self.clear = clear;


		/////////////////////////////////////////

		// Function Definitions

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
		 * @param model
		 * @param execute
		 * @returns {*}
		 */
		function save(model, execute) {
			execute = typeof execute === 'undefined' ? true : execute;

			return RepositoryService.get(model.className()).save(model).then(function () {
				if (model.__existsRemotely) {
					return RequestService.update(model, execute);
				} else {
					return RequestService.create(model, execute);
				}
			});
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

			/*
			 Add in default filter settings
			 */
			var modelConfig = Model.getConfig();
			if (typeof modelConfig.sync !== 'undefined') {
				options.filter = options.filter || {};
				angular.merge(options.filter, modelConfig.sync);
			}

			/*
			 Get the updated Date
			 */
			return repo.updatedAt()
				.then(function (updatedAt) {
					if (updatedAt !== null) {
						options.updatedAt = updatedAt;
					}
					return RequestService.find(Model, options);
				}).then(function (data) {
					//save the data
					return _saveResponseDataLocally(Model, data, true);
				});
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
			//construct models from them
			if (data.length > 0) {
				var models = [];
				angular.forEach(data, function (item) {
					models.push(Model.create(item, false, true));
				});
				if (sync) {
					return RepositoryService.get(Model).sync(models, $scope).then(function () {
						return $q.when(models);
					});
				} else {
					return RepositoryService.get(Model).save(models, $scope).then(function () {
						return $q.when(models);
					})
				}
			} else {
				return $q.when([]);
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
			var repo = RepositoryService.get(Model);

			return repo.updatedAt().then(function (date) {
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
		 * @returns {Promise}
		 */
		function find(Model, options, $scope) {
			var repo = RepositoryService.get(Model);

			return repo.find(options.filter, $scope);
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


	}
})
();

