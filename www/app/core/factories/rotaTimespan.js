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
		
		var ERROR_CODES = {
			NO_ENTER_EVENT: 1,
			NO_EXIT_EVENT:  2
		};
		
		var RotaTimespan = DataStore.create('RotaTimespans', 'moment')
			.key('objectId')
			.schema({
				location:        null,
				enter:           null,
				exit:            null,
				duration:        0,
				notes:           '',
				deleted:         false,
				ownerId:         '',
				errorCode:       null,
				unresolvedError: false
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
		
		//Set the static properties
		RotaTimespan.ERROR_CODES = ERROR_CODES;
		
		return RotaTimespan;
	}
})();

