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


	var Rota;

	run.$inject = ['Session', 'DataStore'];

	/* @ngInject */
	function run(Session, DataStore) {

		var BANDING_OPTIONS = [
			{name: 'None', value: 0},
			{name: '1c', value: 30},
			{name: '1b', value: 40},
			{name: '1a', value: 50}
		];


		Rota = DataStore.create('Rotas')
			.key('objectId')
			.schema({
				label: '',
				hours: 40,
				dateStart: new Date(),
				dateEnd: null,
				banding: 0,
				ownerId: ''
			})
			.relationship('hasOne', 'organisation', 'RotaOrganisations')
			.relationship('hasOne', 'speciality', 'RotaSpecialities')
			.relationship('hasOne', 'role', 'RotaRoles')
			.relationship('hasMany', 'locations', 'RotaLocations.rota')
			.relationship('hasOne', 'user', 'Users')
			.validators({
				label: true,
				organisation: true,
				speciality: true,
				role: true
			})
			.config({
				sync: function () {
					return {
						user: Session.userId || null
					}
				}
			});

		Rota.BANDING_OPTIONS = BANDING_OPTIONS;
	}


	factory.$inject = ['DataStore', 'Session', '$rootScope'];

	/* @ngInject */
	function factory() {
		return Rota;
	}

})();

