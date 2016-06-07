(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.controller('RotaViewController', RotaViewController);
	
	RotaViewController.$inject = ['RotaViewService', 'currentRota'];

	/* @ngInject */
	function RotaViewController(RotaViewService, currentRota) {
		var vm = this;

		RotaViewService.start(currentRota);

		vm.id = RotaViewService.rota.getKey();
	}

})();

