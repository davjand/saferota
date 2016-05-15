(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(run)
		.factory('RotaTimespan', factory);

	/*
	 * RotaTimespan Object Definition
	 *
	 * NB: In run block so is always executed to ensure initialised into
	 * sync cycle
	 *
	 *
	 */

	run.$inject = ['RotaTimespan'];

	/* @ngInject */
	function run(RotaTimespan) {
		//ensure run
	}

	factory.$inject = ['DataStore'];

	/* @ngInject */
	function factory(DataStore) {
		return DataStore.create('RotaTimespans')
			.key('objectId')
			.schema({
				location: null,
				enter: null,
				exit: null,
				duration: 0,
				ownerId: ''
			})
			.relationship('hasOne', 'rota', 'Rotas');
	}
})();

