(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.controller('RotaViewLogController', RotaViewLogController);

	RotaViewLogController.$inject = [
		'RotaViewService',
		'$scope',
		'$state',
		'WeekCollection',
		'Pager',
		'RotaTimespan',
		'moment'];

	/* @ngInject */
	function RotaViewLogController(RotaViewService,
								   $scope,
								   $state,
								   WeekCollection,
								   Pager,
								   RotaTimespan,
								   moment) {
		var vm = this;
		
		var collection;
		vm.pager = {};
		
		vm.rota = RotaViewService.rota;
		vm.change = RotaViewService.change;
		vm.moment = moment;
		
		vm.$loaded = false;

		vm.remove = remove;
		vm.find = find;
		vm.add = add;
		vm.reload = reload;


		activate();

		/*
		 *
		 * Function Definitions
		 *
		 */
		function activate() {
			vm.find();

			//Watch for new items
			RotaTimespan.on('new', vm.reload);
			$scope.$on('$destroy', function () {
				RotaTimespan.off('new', vm.reload);
			});
		}


		/**
		 * find
		 *
		 * Find timespans to display
		 *
		 */
		function find() {
			vm.$loaded = false;
			RotaTimespan.$find({
				filter: {
					rota: RotaViewService.rota.getKey(),
					deleted: false
				}
			}, $scope).then(function (timespans) {
				collection = new WeekCollection();
				collection.add(timespans);
				vm.pager = new Pager(collection);
				vm.$loaded = true;
			});
		}
		
		function reload() {
			collection.sort();
			vm.pager.reload();
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
			timespan.$save();
		}
		
		
		function add() {
			var timespan = RotaTimespan.create({
				rota:     vm.rota.getKey(),
				location: "",
				enter:    moment().subtract(vm.rota.defaultShiftLength, 'hours').valueOf(),
				exit:     moment().valueOf()
			});
			timespan.calculateDuration();
			timespan.$save().then(function () {
				$state.go('app.view.logs-edit', {timespanId: timespan.getKey()});
			})
		}


	}

})();

