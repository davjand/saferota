(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('RotaListController', RotaListController);

	RotaListController.$inject = [
		'$state',
		'Rota',
		'$scope',
		'$rootScope',
		'DATA_EVENTS',
		'$ionicListDelegate'
	];

	/* @ngInject */
	function RotaListController($state,
								Rota,
								$scope,
								$rootScope,
								DATA_EVENTS,
								$ionicListDelegate) {
		var vm = this;

		vm.sync = sync;
		vm.add = add;
		vm.edit = edit;

		activate();

		////////////////

		function activate() {
			//vm.rotas = userRotas;
			//DataStore.registerScope(vm.rotas,$scope);
			Rota.$find({}, $scope).then(function (rotas) {
				vm.rotas = rotas;
			})
		}

		function sync() {
			$rootScope.$emit(DATA_EVENTS.REFRESH_DATA);
		}

		function add() {
			$state.go('app.new');
		}

		function edit(rota) {
			$ionicListDelegate.closeOptionButtons();
			$state.go('app.edit', {rotaId: rota.getKey()});
		}
	}

})();

