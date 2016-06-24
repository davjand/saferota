(function () {
	'use strict';
	
	angular
		.module('saferota.rota-log')
		.controller('RotaIssuesController', RotaIssuesController);
	
	RotaIssuesController.$inject = ['RotaTimespan', 'OrderedCollection'];
	
	/* @ngInject */
	function RotaIssuesController(RotaTimespan, OrderedCollection) {
		var vm = this;
		vm.title = 'RotaIssuesController';
		
		activate();
		
		////////////////
		
		function activate() {
		}
	}
	
})();

