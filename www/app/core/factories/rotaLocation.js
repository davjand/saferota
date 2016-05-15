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

	run.$inject = ['RotaLocation'];

	/* @ngInject */
	function run(RotaLocation) {
		//ensure initialized
	}

	factory.$inject = ['DataStore'];

	/* @ngInject */
	function factory(DataStore) {
		return DataStore.create('RotaLocations')
			.key('objectId')
			.schema({
				location: {},
				lat: null,
				long: null,
				ownerId: '',
				radius: 400
			})
			.relationship('hasOne', 'rota', 'Rotas');
	}
})();

