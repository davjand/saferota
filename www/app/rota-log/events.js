(function () {
	'use strict';

	angular
		.module('saferota.rota-log')
		.controller('RotaViewEventController', RotaViewEventController);

	RotaViewEventController.$inject = ['RotaEvent', '$scope', 'RotaViewService'];

	/* @ngInject */
	function RotaViewEventController(RotaEvent, $scope, RotaViewService) {
		var vm = this;

		var LIMIT = 3,
			eventsCache = [];

		vm.$more = true;
		vm.$loading = true;

		vm.events = [];

		vm.nextPage = nextPage;

		activate();


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

