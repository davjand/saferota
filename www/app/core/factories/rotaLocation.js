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
				uniqueIdentifier: guid(),
				lat: null,
				long: null,
				ownerId: '',
				radius: 400
			})
			.relationship('hasOne', 'rota', 'Rotas');


		/**
		 * guid
		 *
		 * Generate a Unique Identifier to use for local IDs
		 *
		 * Credit to Stack Overflow
		 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
		 *
		 * @returns {string}
		 */
		function guid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();

		}
	}


})();

