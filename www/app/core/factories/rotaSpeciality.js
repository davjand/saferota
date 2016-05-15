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
	function run(RotaSpeciality) {
		//Ensure Run
	}


	factory.$inject = ['DataStore'];

	/* @ngInject */
	function factory(DataStore) {
		return DataStore.create('RotaSpecialities')
			.key('objectId')
			.schema({
				title: '',
				code: '',
				category: ''
			});
	}

})();

