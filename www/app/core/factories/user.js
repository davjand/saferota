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
	
	run.$inject = ['User',];

	/* @ngInject */
	function run(User) {
		//ensure initialized
	}
	
	factory.$inject = ['DataStore', 'Session'];

	/* @ngInject */
	function factory(DataStore, Session) {
		return DataStore.create('Users')
			.key('objectId')
			.schema({
				firstName: '',
				lastName: '',
				email: ''
			})
			.config({
				sync: function () {
					return {
						objectId: Session.userId || null
					}
				}
			});
	}
})();

