(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('RotaRoleService', rotaRoleService);

	rotaRoleService.$inject = ['DataStore'];

	/* @ngInject */
	function rotaRoleService(DataStore) {
		var self = this;

		/*
		 * Module Definition
		 */
		self.get = getRoles;


		/*
		 * Initialise
		 */
		var RotaRole =
			DataStore.create('RotaRoles')
				.key('objectId')
				.schema({title: '', code: ''});

		DataStore.sync(RotaRole);


		////////////////

		/**
		 * getRoles
		 *
		 * Returns a promise to the RotaRole Data
		 *
		 * @returns {*}
		 */
		function getRoles() {
			return DataStore.find(RotaRole);
		}
	}

})();

