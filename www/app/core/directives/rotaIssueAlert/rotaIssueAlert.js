(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.directive('rotaIssueAlert', rotaIssueAlert);
	
	rotaIssueAlert.$inject = ['TimespanIssuesService'];
	
	/* @ngInject */
	function rotaIssueAlert(TimespanIssuesService) {
		return {
			bindToController: true,
			controller:       DirectiveController,
			controllerAs:     'vm',
			scope:            {},
			templateUrl:      'app/core/directives/rotaIssueAlert/rotaIssueAlert.html',
		};
	}
	
	DirectiveController.$inject = ['TimespanIssuesService', '$scope'];
	
	/* @ngInject */
	function DirectiveController(TimespanIssuesService) {
		var vm = this;
		vm.service = TimespanIssuesService;
	}
	
})();

