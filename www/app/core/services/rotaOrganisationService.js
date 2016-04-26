(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('RotaOrganisationService', rotaOrganisationService);

	rotaOrganisationService.$inject = ['DataStore'];

	/* @ngInject */
	function rotaOrganisationService(DataStore) {
		var self = this;

		/*
		 * Module Definition
		 */
		self.get = get;


		/*
		 * Initialise
		 */
		var RotaOrganisation =
			DataStore.create('RotaOrganisations')
				.key('objectId')
				.schema({
					postcode: '',
					nationalGrouping: '',
					name: '',
					highLevelHealthGeography: '',
					code: '',
					address1: '',
					address2: '',
					address3: '',
					address4: '',
					address5: ''
				})
				.key('objectId');

		DataStore.sync(RotaOrganisation);


		////////////////

		/**
		 * get
		 *
		 * Returns a promise to the data
		 *
		 * @returns {*}
		 */
		function get() {
			return DataStore.find(RotaOrganisation);
		}
	}

})();

