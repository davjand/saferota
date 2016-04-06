(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('RepositoryService', RepositoryService);

	RepositoryService.$inject = ['Repository'];

	/* @ngInject */
	function RepositoryService(Repository) {
		var self = this;

		this.$cache = {};

		this.create = create;
		this.get = getRepo;
		this.notify = notify;
		this.clear = clear;
		this.notify = notify;

		////////////////

		/**
		 *
		 * Creates a model and corresponding repository
		 *
		 * @param Model
		 * @returns {*}
		 */
		function create(Model) {
			if (typeof self.$cache[Model.className()] !== 'undefined') {
				throw('Error: RepositoryService.new "'+name+'" already exists');
			}
			self.$cache[Model.className()] = new Repository(Model);

			return self.$cache[Model.className()];
		}

		/**
		 * getRepo
		 *
		 * Returns a repository for a model
		 * 
		 *
		 * @param name {String|Model} The model name or the model object
		 * @returns {Repository}
		 */
		function getRepo(name){

			if(typeof name !== 'string'){
				name = name.className();
			}
			if(typeof self.$cache[name] === 'undefined'){
				throw('Error: RepositoryService.get "'+name+'" could not be found');
			}
			return self.$cache[name];
		}


		/**
		 * .clear
		 *
		 * Clears the cache
		 *
		 */
		function clear() {
			this.$cache = [];
		}

		/**
		 * notify
		 *
		 * Notifies a models repository of a complete transaction
		 *
		 * @param transaction {Transaction}
		 */
		function notify(transaction) {
			self.get(transaction.modelName).notify(transaction);
		}
	}

})();

