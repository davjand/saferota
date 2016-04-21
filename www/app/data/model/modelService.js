(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('ModelService', ModelService);

	ModelService.$inject = ['Model'];

	/* @ngInject */
	function ModelService(Model) {
		var self = this;

		self.$cache = {};

		self.create = create;
		self.get = getModel;
		self.clear = clear;
		self.isLocalId = isLocalId;
		self.getAll = function () {
			return self.$cache
		};
		
		////////////////

		/**
		 *
		 * create
		 *
		 * Creates a new model and caches it in the service
		 *
		 * @param name
		 * @param onCreate {Function}
		 *
		 * @returns {*}
		 */
		function create(name, onCreate) {
			if(typeof self.$cache[name] !== 'undefined'){
				throw('Error: ModelService.new "'+name+'" already exists');
			}
			self.$cache[name] = new Model(name, onCreate);
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
		 * isLocalId
		 *
		 * Crude method of determining if a local Id is local or not.
		 *
		 * @param id
		 * @returns {boolean}
		 */
		function isLocalId(id) {
			return id && id.indexOf('local') !== -1 && id.length === 42;
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

