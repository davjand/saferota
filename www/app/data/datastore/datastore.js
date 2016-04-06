(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('DataStore', DataStore);

	DataStore.$inject = ['ModelService', 'RepositoryService', 'RequestService', '$rootScope'];

	/* @ngInject */
	function DataStore(ModelService, RepositoryService, RequestService, $rootScope) {
		var self = this;

		//Module Definition
		self.create = create;
		self.save = save;
		self.fetch = fetch;
		self.get = get;


		/////////////////////////////////////////

		// Function Definitions

		/////////////////////////////////////////


		function create(name, $scope) {
			$scope = $scope || $rootScope;

			var Model = ModelService.create(name, function () {
				RepositoryService.get(this).registerModel(this, $scope);
			});
			RepositoryService.create(Model);
			return Model;
		}


		function save(model) {

		}


		function fetch(Model, options) {

		}

		function get(Model, id) {

		}


	}

})();

