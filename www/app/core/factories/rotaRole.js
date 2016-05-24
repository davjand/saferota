(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(run)
		.factory('RotaRole', factory);

	/*
	 * RotaRole Object Definition
	 *
	 * NB: In run block so is always executed to ensure initialised into
	 * sync cycle
	 *
	 *
	 */

	run.$inject = ['RotaRole'];

	/* @ngInject */
	function run(RotaRole) {
		//ensure init
	}

	factory.$inject = ['DataStore'];

	/* @ngInject */
	function factory(DataStore) {
		return DataStore.create('RotaRoles')
				.key('objectId')
			.schema({title: '', code: '', other: false});
	}

})();