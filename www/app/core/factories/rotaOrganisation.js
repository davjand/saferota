(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(run)
		.factory('RotaOrganisation', factory);

	/*
	 * RotaOrganisation Object Definition
	 *
	 * NB: In run block so is always executed to ensure initialised into
	 * sync cycle
	 *
	 *
	 */


	run.$inject = ['RotaOrganisation'];

	/* @ngInject */
	function run(RotaOrganisation) {
		//ensure initialized
	}

	factory.$inject = ['DataStore'];

	/* @ngInject */
	function factory(DataStore) {
		return DataStore.create('RotaOrganisations')
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
			});
	}

})();
