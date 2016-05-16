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

	factory.$inject = ['DataStore', 'moment'];

	/* @ngInject */
	function factory(DataStore) {
		return DataStore.create('RotaTimespans', 'moment')
			.key('objectId')
			.schema({
				location: null,
				enter: null,
				exit: null,
				duration: 0,
				notes: '',
				deleted: false,
				ownerId: ''
			})
			.relationship('hasOne', 'rota', 'Rotas')
			.methods({

				/**
				 * calculateDuration
				 *
				 * Calculates the duration
				 *
				 */
				calculateDuration: function () {
					this.duration = moment
						.duration(moment(this.exit).diff(this.enter))
						.as('minutes');
				}
			});
	}
})();

