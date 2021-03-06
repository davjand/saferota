(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(run)
		.factory('Rota', factory);

	/*
	 * Rota Object Definition
	 *
	 * NB: In run block so is always executed to ensure initialised into
	 * sync cycle
	 *
	 *
	 */

	run.$inject = ['Rota'];

	/* @ngInject */
	function run(Rota) {
		//ensure run
	}


	factory.$inject = ['Session', 'DataStore', 'moment'];

	/* @ngInject */
	function factory(Session, DataStore, moment) {
		var BANDING_OPTIONS = [
			{name: 'None', value: 0},
			{name: '10%', value: 10},
			{name: '20%', value: 20},
			{name: '30%', value: 30},
			{name: '40%', value: 40},
			{name: '50%', value: 50},
			{name: '60%', value: 60},
			{name: '70%', value: 70},
			{name: '80%', value: 80},
			{name: '90%', value: 90},
			{name: '100%', value: 100}
		];


		var Rota = DataStore.create('Rotas')
			.key('objectId')
			.schema({
				label:              '',
				hours:              48,
				dateStart:          moment().valueOf(),
				dateEnd:            null,
				banding:            0,
				ownerId:            '',
				archived:           false,
				minimumTime:        30,
				adjustShiftStart:   5,
				adjustShiftEnd:     5,
				defaultShiftLength: 8
			})
			.relationship('hasOne', 'organisation', 'RotaOrganisations')
			.relationship('hasOne', 'speciality', 'RotaSpecialities')
			.relationship('hasOne', 'role', 'RotaRoles')
			.relationship('hasMany', 'locations', 'RotaLocations.rota')
			.relationship('hasOne', 'user', 'Users')
			.validators({
				label: true
			})
			.config({
				sync: function () {
					return {
						user: Session.userId || null
					}
				}
			});

		Rota.BANDING_OPTIONS = BANDING_OPTIONS;

		return Rota;
	}

})();

