(function () {
	'use strict';
	
	angular
		.module('saferota.rota-new')
		.controller('NewRotaCompleteController', NewRotaCompleteController);
	
	NewRotaCompleteController.$inject = ['NewRotaService'];
	
	/* @ngInject */
	function NewRotaCompleteController(NewRotaService) {
		var vm = this;
		vm.close = close;
		
		function close() {
			NewRotaService.complete();
		}
	}
	
})();

