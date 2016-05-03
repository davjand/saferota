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

	var RotaRole;

	run.$inject = ['DataStore'];

	/* @ngInject */
	function run(DataStore) {
		RotaRole =
			DataStore.create('RotaRoles')
				.key('objectId')
				.schema({title: '', code: ''});
	}

	factory.$inject = [];

	/* @ngInject */
	function factory() {
		return RotaRole
	}

})();