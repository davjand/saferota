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

	var RotaTimespan;

	run.$inject = ['DataStore'];

	/* @ngInject */
	function run(DataStore) {
		RotaTimespan = DataStore.create('RotaTimeSpans')
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

	/* @ngInject */
	function factory() {
		return RotaTimespan
	}
})();

