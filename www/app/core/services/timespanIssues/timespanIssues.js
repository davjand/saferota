(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.service('TimespanIssuesService', TimespanIssuesService);
	
	TimespanIssuesService.$inject = ['RotaTimespan'];
	
	/* @ngInject */
	function TimespanIssuesService(RotaTimespan) {
		
	}
	
})();

