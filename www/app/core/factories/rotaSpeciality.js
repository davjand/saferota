(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(run)
		.factory('RotaSpeciality', factory);

	/*
	 * RotaSpeciality Object Definition
	 *
	 * NB: In run block so is always executed to ensure initialised into
	 * sync cycle
	 *
	 * 
	 */

	var RotaSpeciality;

	run.$inject = ['DataStore'];

	/* @ngInject */
	function run(DataStore) {
		RotaSpeciality =
			DataStore.create('RotaSpecialities')
				.key('objectId')
				.schema({
					title: '',
					code: '',
					category: ''
				});
	}


	factory.$inject = [];

	/* @ngInject */
	function factory() {
		return RotaSpeciality
	}

})();

