(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('RotaListController', RotaListController);

	RotaListController.$inject = [
		'$state',
		'$rootScope',
		'DATA_EVENTS',
		'userRotas'];

	/* @ngInject */
	function RotaListController($state,
								$rootScope,
								DATA_EVENTS,
								userRotas) {
		var vm = this;

		vm.sync = sync;
		vm.add = add;

		activate();

		////////////////

		function activate() {
			vm.rotas = userRotas;
		}

		function sync() {
			$rootScope.$emit(DATA_EVENTS.REFRESH_DATA);
		}

		function add() {
			$state.go('app.new');
		}
	}

})();

