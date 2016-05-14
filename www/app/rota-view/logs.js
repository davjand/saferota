(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.controller('RotaViewLogController', RotaViewLogController);

	RotaViewLogController.$inject = ['RotaViewService', '$scope'];

	/* @ngInject */
	function RotaViewLogController(RotaViewService, $scope) {
		var vm = this;

		vm.rota = RotaViewService.rota;
		//vm.rota.$register($scope);

		vm.change = RotaViewService.change;
	}

})();

