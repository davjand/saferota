(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.service('Session', Session);

	Session.$inject = ['User'];

	/* @ngInject */
	function Session(User) {
		this.start = start;
		this.clear = clear;

		////////////////

		function start() {

		}

		function clear(){

		}
	}

})();

