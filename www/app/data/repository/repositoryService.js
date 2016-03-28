(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('RepositoryService', RepositoryService);

	RepositoryService.$inject = ['Repository','Model'];

	/* @ngInject */
	function RepositoryService(Repository,Model) {
		var self = this;

		this.$cache = {};

		this.create = create;
		this.get = getRepo;

		////////////////

		/**
		 *
		 * Creates a repository for a model
		 *
		 * @param Model {Model}
		 * @param localAdapter {LocalAdapterInterface} (optional)
		 * @param remoteAdapter {RemoteAdapterInterface} (optional)
		 * @returns {*}
		 */
		function create(Model, localAdapter, remoteAdapter) {
			var name = Model.className();

			localAdapter = localAdapter || null;
			remoteAdapter = remoteAdapter || null;

			if(typeof self.$cache[name] !== 'undefined'){
				throw('Error: RepositoryService.new "'+name+'" already exists');
			}
			self.$cache[name] = new Repository(Model,localAdapter,remoteAdapter);
			return self.$cache[name];
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
	}

})();
