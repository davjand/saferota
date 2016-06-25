(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.controller('RotaViewSettingsController', RotaViewSettingsController);

	RotaViewSettingsController.$inject = [
		'RotaViewService',
		'SettingsService'
	];

	/* @ngInject */
	function RotaViewSettingsController(RotaViewService,
										SettingsService) {
		var vm = this;
		vm.rota = RotaViewService.rota;
		vm.change = RotaViewService.change;
		
		
		// Functions
		vm.settings = settings;

		/*
		 * 
		 * 
		 * Function Definitions
		 * 
		 * 
		 */
		function settings() {
			SettingsService.show();
		}
	}

})();

