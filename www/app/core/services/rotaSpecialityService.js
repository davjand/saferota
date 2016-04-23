(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('rotaSpecialityService', rotaSpecialityService);

	rotaSpecialityService.$inject = ['DataStore'];

	/* @ngInject */
	function rotaSpecialityService(DataStore) {
		var self = this;

		/*
		 * Module Definition
		 */
		self.get = get;


		/*
		 * Initialise
		 */
		var RotaSpeciality =
			DataStore.create('RotaSpecialities')
				.schema({
					title: '',
					code: '',
					category: ''
				});

		DataStore.sync(RotaSpeciality);


		////////////////////////////////////////////////////////////////

		// Function Definitions

		////////////////////////////////////////////////////////////////

		/**
		 * get
		 *
		 * Returns a promise to the data
		 *
		 * @returns {*}
		 */
		function get() {
			return DataStore.find(RotaSpeciality);
		}
	}

})();

