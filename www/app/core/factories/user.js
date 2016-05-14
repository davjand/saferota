(function () {
	'use strict';

	angular
		.module('saferota.core')
		.run(run)
		.factory('User', factory);

	/*
	 * User Object Definition
	 *
	 * NB: In run block so is always executed to ensure initialised into
	 * sync cycle
	 *
	 *
	 */

	var User;

	run.$inject = ['DataStore'];

	/* @ngInject */
	function run(DataStore) {
		User = DataStore.create('Users')
			.key('objectId')
			.schema({
				firstName: '',
				lastName: '',
				email: ''
			})
			.config({
				sync: false
			});
	}

	/* @ngInject */
	function factory() {
		return User;
	}
})();

