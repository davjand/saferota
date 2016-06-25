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
					this.duration = Math.round(moment
						.duration(moment(this.exit).diff(this.enter))
						.as('minutes'));
				},
				
				/**
				 * returns true if after the exit
				 * @param date
				 * @returns {boolean}
				 */
				afterExit: function (date) {
					return !moment(date).isBefore(this.exit)
				},
				
				/**
				 * returns true if before the enter time
				 * @param date
				 * @returns {boolean}
				 */
				beforeEnter: function (date) {
					return !moment(date).isAfter(this.enter)
				},
				
				/**
				 * set a new start date but keep the duration constant
				 * @param date
				 */
				translateByNewEnterDate: function (date) {
					this.calculateDuration();
					this.exit = moment(date).add(this.duration, 'minutes').valueOf();
					this.enter = date;
				},
				/**
				 * set a new start date but keep the duration constant
				 * @param date
				 */
				translateByNewExitDate:  function (date) {
					this.calculateDuration();
					this.enter = moment(date).subtract(this.duration, 'minutes').valueOf();
					this.exit = date;
				}
			});
		
		//Set the static properties
		RotaTimespan.ERROR_CODES = ERROR_CODES;
		
		return RotaTimespan;
	}
})();

