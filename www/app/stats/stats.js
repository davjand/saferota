(function () {
	'use strict';

	angular
		.module('saferota.stats')
		.controller('StatsController', StatsController);

	StatsController.$inject = [
		'RotaViewService',
		'RotaTimespan'];

	/* @ngInject */
	function StatsController(RotaViewService,
							 RotaTimespan) {
		var vm = this;


		vm.rota = RotaViewService.rota;
		vm.change = RotaViewService.change;
		vm.displayStats = false;
		/*
		 *
		 * Interface
		 *
		 */
		vm.activate = activate;


		//Start
		vm.activate();

		/*
		 *
		 *
		 *
		 * Function Definitions
		 *
		 *
		 *
		 */

		function activate() {

		}

	}

})();

