(function () {
	'use strict';

	angular
		.module('saferota.rota-log')
		.controller('RotaViewEventController', RotaViewEventController);

	RotaViewEventController.$inject = ['RotaEvent', '$scope', 'RotaViewService'];

	/* @ngInject */
	function RotaViewEventController(RotaEvent, $scope, RotaViewService) {
		var vm = this;

		var LIMIT = 10,
			eventsCache = [];

		vm.$more = true;
		vm.$loading = true;

		vm.events = [];

		vm.nextPage = nextPage;

		activate();


		/**
		 * activate
		 *
		 * Load and register the scope for the events
		 *
		 */
		function activate() {
			RotaEvent.$find({
				orderBy: '-timestamp',
				filter: {
					rota: RotaViewService.rota.getKey()
				}
			}, $scope).then(function (events) {
				eventsCache = events || [];
				vm.nextPage();
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

