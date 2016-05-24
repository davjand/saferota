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

		vm.rota = RotaViewService.rota;
		vm.logs = {};
		vm.change = RotaViewService.change;
		vm.moment = moment;

		vm.remove = remove;
		vm.find = find;


		activate();

		/*
		 *
		 * Function Definitions
		 *
		 */
		function activate() {
			vm.find();

			//Watch for new items
			RotaTimespan.on('new', vm.find);
			$scope.$on('$destroy', function () {
				RotaTimespan.off('new', vm.find);
			});
		}


		/**
		 * find
		 *
		 * Find timespans to display
		 *
		 */
		function find() {
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

		/**
		 * remove
		 *
		 * Marks a timespan as deleted
		 *
		 * @param timespan
		 */
		function remove(timespan) {
			timespan.deleted = true;
			timespan.$save().then(function () {
				activate();
			})
		}


	}

})();

