(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(run)
		.factory('RotaEvent', factory);

	/*
	 * RotaTimespan Object Definition
	 *
	 * NB: In run block so is always executed to ensure initialised into
	 * sync cycle
	 *
	 *
	 */

	var RotaEvent;

	run.$inject = ['DataStore'];

	/* @ngInject */
	function run(DataStore) {
		RotaEvent = DataStore.create('RotaEvents')
			.key('objectId')
			.schema({
				location: null,
				type: null,
				timestamp: 0,
				exited: false,
				error: null,
				ownerId: ''
			})
			.relationship('hasOne', 'rota', 'Rotas');
	}

	/* @ngInject */
	function factory() {
		return RotaEvent
	}
})();

