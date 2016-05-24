(function () {
	'use strict';

	angular
		.module('saferota.share')
		.controller('ShareController', ShareController);

	ShareController.$inject = ['$cordovaSocialSharing', 'RotaViewService'];

	/* @ngInject */
	function ShareController($cordovaSocialSharing, RotaViewService) {
		var vm = this;

		vm.rota = RotaViewService.rota;
		vm.change = RotaViewService.change;

		vm.share = share;
		vm.activate = activate;


		activate();

		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		function activate() {

		}


		function share() {
			$cordovaSocialSharing.share(
				'Improve patient safety with accountable hours monitoring. Saferota uses low powered geofence technology.\nhttp://saferota.com', //message
				'Safer Rotas with SafeRota' //subject
			);
		}
	}

})();

