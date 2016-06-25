(function () {
	'use strict';
	
	angular
		.module('saferota.rota-log')
		.controller('RotaIssuesController', RotaIssuesController);
	
	RotaIssuesController.$inject = ['TimespanIssuesService', '$stateParams', '$ionicHistory', '$state'];
	
	/* @ngInject */
	function RotaIssuesController(TimespanIssuesService, $stateParams, $ionicHistory, $state) {
		var self = this;
		self.service = TimespanIssuesService;
		self.rotaId = $stateParams.rotaId;
		
		self.goBack = function () {
			$ionicHistory.nextViewOptions({historyRoot: true});
			$state.go('app.view.logs', {rotaId: self.rotaId})
		}
	}
	
})();

