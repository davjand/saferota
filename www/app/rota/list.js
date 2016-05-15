(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('RotaListController', RotaListController);

	RotaListController.$inject = [
		'$state',
		'$scope',
		'userRotas',
		'activeRotas',
		'$rootScope',
		'DATA_EVENTS',
		'DataStore',
		'Rota',
		'$ionicListDelegate',
		'RotaGeoFenceService',
		'$ionicLoading'
	];

	/* @ngInject */
	function RotaListController($state,
								$scope,
								userRotas,
								activeRotas,
								$rootScope,
								DATA_EVENTS,
								DataStore,
								Rota,
								$ionicListDelegate,
								RotaGeoFenceService,
								$ionicLoading) {
		var vm = this;

		vm.edit = edit;
		vm.isActive = isActive;

		vm.activate = activateRota;
		vm.deactivate = deactivate;
		vm.selectRota = selectRota;

		activate();

		////////////////

		function activate() {
			vm.rotas = userRotas;
			DataStore.registerScope(vm.rotas, $scope);
			vm.activeRotas = activeRotas;

			var offSyncComplete = $rootScope.$on(DATA_EVENTS.SYNC_FINISH, _handleSyncComplete);

			$scope.$on('$destroy', function () {
				offSyncComplete();
			})
		}

		function _handleSyncComplete() {
			//reload
			Rota.$find().then(function (rotas) {
				if (rotas.length > vm.rotas.length) {
					$state.go($state.current, {}, {reload: true});
				}
			});
		}

		/**
		 * edit
		 *
		 * Edit a rota
		 *
		 * @param rota
		 */
		function edit(rota) {
			$ionicListDelegate.closeOptionButtons();
			$state.go('app.edit', {rotaId: rota.getKey()});
		}

		/**
		 * isActive
		 *
		 * isActive
		 *
		 * @param rota
		 * @returns {boolean}
		 */
		function isActive(rota) {
			return vm.activeRotas.indexOf(rota.getKey()) !== -1;
		}

		/**
		 * activate
		 *
		 * Activate a rota then refresh
		 *
		 * @param rota
		 * @param $event
		 */
		function activateRota(rota, $event) {
			$event.stopPropagation();
			$ionicLoading.show();
			RotaGeoFenceService.activate(rota)
				.then(RotaGeoFenceService.getActiveRotaIds)
				.then(function (activeRotas) {
					vm.activeRotas = activeRotas;
					$ionicLoading.hide();
					$state.go($state.current, {}, {reload: true});
				});
		}

		/**
		 * deactivate
		 *
		 * Deactivate a rota then refresh
		 *
		 * @param rota
		 * @param $event
		 */
		function deactivate(rota, $event) {
			$event.stopPropagation();
			$ionicLoading.show();
			RotaGeoFenceService.deactivate(rota)
				.then(RotaGeoFenceService.getActiveRotaIds)
				.then(function (activeRotas) {
					vm.activeRotas = activeRotas;
					$ionicLoading.hide();
					$state.go($state.current, {}, {reload: true});
				});
		}

		/**
		 * selectRota
		 *
		 * Selects the rota and changes state to view the rota
		 *
		 * @param rota
		 */
		function selectRota(rota) {
			$state.go('app.view.logs', {rotaId: rota.getKey()});
		}

	}

})();

