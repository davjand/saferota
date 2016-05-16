(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.controller('RotaViewLogController', RotaViewLogController);

	RotaViewLogController.$inject = [
		'RotaViewService',
		'$scope',
		'RotaTimespanFormatterService',
		'RotaTimespan',
		'moment'];

	/* @ngInject */
	function RotaViewLogController(RotaViewService,
								   $scope,
								   RotaTimespanFormatterService,
								   RotaTimespan,
								   moment) {
		var vm = this;

		vm.logs = {};
		vm.change = RotaViewService.change;
		vm.moment = moment;
		vm.remove = remove;


		activate();

		/*
		 *
		 * Function Definitions
		 *
		 */

		function activate() {
			vm.logs = {};

			RotaTimespan.$find({
				filter: {
					rota: RotaViewService.rota.getKey(),
					deleted: false
				}
			}, $scope).then(function (timespans) {
				vm.logs = RotaTimespanFormatterService.groupByWeek(timespans);
			});
		}

		function remove(timespan) {
			timespan.deleted = true;
			timespan.$save().then(function () {
				activate();
			})
		}


	}

})();

