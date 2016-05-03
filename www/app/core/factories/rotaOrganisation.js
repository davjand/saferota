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

	var RotaOrganisation;

	run.$inject = ['DataStore'];

	/* @ngInject */
	function run(DataStore) {
		RotaOrganisation =
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
				});
	}

	factory.$inject = [];

	/* @ngInject */
	function factory() {
		return RotaOrganisation
	}

})();
