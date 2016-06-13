(function () {
	'use strict';

	angular
		.module('saferota.rota-log')
		.controller('RotaViewEventController', RotaViewEventController);

	RotaViewEventController.$inject = ['RotaEvent', '$scope', '$q', 'RotaViewService'];

	/* @ngInject */
	function RotaViewEventController(RotaEvent, $scope, $q, RotaViewService) {
		var vm = this;

		var LIMIT = 10,
			eventsCache = [];

		vm.$more = true;
		vm.$loading = true;

		vm.events = [];

		vm.nextPage = nextPage;
		vm.find = find;

		activate();

		////////////////////////////////////

		// Function Definitions

		////////////////////////////////////

		function activate() {
			vm.find();

			//Watch for new items
			RotaEvent.on('new', vm.find);

			$scope.$on('$destroy', function () {
				RotaEvent.off('new', vm.find);
			});
		}


		/**
		 * find
		 *
		 * Load and register the scope for the events
		 *
		 */
		function find() {
			return RotaEvent.$find({
				orderBy: '-timestamp',
				filter: {
					rota: RotaViewService.rota.getKey()
				}
			}, $scope).then(function (events) {
				eventsCache = events || [];
				vm.events = [];
				vm.nextPage();
				return $q.when();
			})
		}

		/**
		 * nextPage
		 *
		 * Loads the next page
		 *
		 * Sets vm.$more to false when no more events
		 * Sets vm.$loading to true/false whilst loading
		 *
		 * Splices another pages worth from the loaded array onto the vm.events array
		 *
		 */
		function nextPage() {
			vm.$loading = true;

			if (eventsCache.length === 0) {
				vm.$more = false;
			}
			else if (eventsCache.length <= LIMIT) {
				vm.events = vm.events.concat(eventsCache.splice(0, eventsCache.length));
				vm.$more = false;
			} else {
				vm.events = vm.events.concat(eventsCache.splice(0, LIMIT));
			}
			vm.$loading = false;
		}


	}

})();

