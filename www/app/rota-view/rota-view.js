(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.controller('RotaViewController', RotaViewController);

	RotaViewController.$inject = ['RotaViewService', 'currentRota', '$scope'];

	/* @ngInject */
	function RotaViewController(RotaViewService, currentRota, $scope) {
		var vm = this;

		RotaViewService.start(currentRota);

		vm.url = '#/app/view/' + currentRota.getKey();
	}

})();

