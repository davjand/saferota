(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(run)
		.factory('RotaLocation', factory);

	/*
	 * RotaLocation Object Definition
	 *
	 * NB: In run block so is always executed to ensure initialised into
	 * sync cycle
	 *
	 *
	 */

	var RotaLocation;

	run.$inject = ['DataStore'];

	/* @ngInject */
	function run(DataStore) {
		RotaLocation = DataStore.create('RotaLocations')
			.schema({
				location: {},
				radius: ''
			})
			.relationship('hasOne', 'rota', 'Rotas');
	}

	/* @ngInject */
	function factory() {
		return RotaLocation
	}
})();

