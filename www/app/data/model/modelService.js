(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('ModelService', ModelService);

	ModelService.$inject = ['Model'];

	/* @ngInject */
	function ModelService(Model) {
		var self = this;
		
		this.$cache = {};
		
		this.create = create;
		this.get = getModel;
		this.clear = clear;
		
		////////////////

		/**
		 *
		 * create
		 *
		 * Creates a new model and caches it in the service
		 *
		 * @param name
		 * @returns {*}
		 */
		function create(name) {
			if(typeof self.$cache[name] !== 'undefined'){
				throw('Error: ModelService.new "'+name+'" already exists');
			}
			self.$cache[name] = new Model(name);
			return self.$cache[name];
		}

		/**
		 *
		 * get
		 *
		 * gets a previously cached model definition
		 *
		 * @param name
		 * @returns {*}
		 */
		function getModel(name){
			if(typeof self.$cache[name] === 'undefined'){
				throw('Error: ModelService.get "'+name+'" could not be found');
			}
			return self.$cache[name];
		}

		/**
		 * clear
		 *
		 * Clears the cache
		 *
		 * @private
		 */
		function clear() {
			self.$cache = [];
		}
	}

})();

