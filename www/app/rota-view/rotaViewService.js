(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.service('RotaViewService', RotaViewService);

	RotaViewService.$inject = ['$rootScope', '$state'];

	/*
	 * Service to store the currently viewed rota
	 *
	 * Call start to init
	 *  - Registers the rota with the current scope
	 *  - When end is called, unloads
	 *
	 */

	/* @ngInject */
	function RotaViewService($rootScope, $state) {

		var self = this;

		var $s = $rootScope.$new();

		self.rota = null;
		self.start = start;
		self.end = end;
		self.change = change;

		/**
		 * start
		 *
		 * Sets self.rota to be the rota and
		 * registers it with the scope
		 *
		 * @param rota
		 */
		function start(rota) {
			if (self.rota === null || rota.getKey() !== self.rota.getKey()) {
				self.rota = rota;
				self.rota.$register($s);
			}
		}

		/**
		 * end
		 *
		 * Nullifys the current rota and destroys the current scope
		 * Creates a new scope
		 *
		 */
		function end() {
			self.rota = null;
			$s.$destroy();
			$s = $rootScope.$new();
		}

		/**
		 * change
		 *
		 * navigates to the change rota state (rota.list)
		 * Destroys the current scope
		 *
		 */
		function change() {
			self.end();
			$state.go('app.list');
		}


	}

})();

