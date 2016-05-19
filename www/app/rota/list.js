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
		'$ionicModal',
		'$ionicPopup',
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
								$ionicModal,
								$ionicPopup,
								DataStore,
								Rota,
								$ionicListDelegate,
								RotaGeoFenceService,
								$ionicLoading) {
		var vm = this;

		vm.archive = archive;
		vm.edit = edit;
		vm.isActive = isActive;
		vm.activate = activateRota;
		vm.deactivate = deactivate;
		vm.selectRota = selectRota;
		vm.settings = settings;

		activate();

		////////////////////////////////////////////////

		//Function Definitions

		////////////////////////////////////////////////

		function activate() {

			vm.rotas = userRotas;
			vm.activeRotas = activeRotas;
			vm.$settingsModal = null;


			/*
			 * Register the $scope for the objects
			 */
			DataStore.registerScope(vm.rotas, $scope);


			var offSyncComplete = $rootScope.$on(DATA_EVENTS.SYNC_FINISH, _handleSyncComplete);

			$scope.$on('$destroy', function () {
				offSyncComplete();

				//Upload the settings modal;
				if (vm.$settingsModal) {
					vm.$settingsModal.remove();
				}
			})
		}

		/**
		 * _handleSyncComplete
		 *
		 * @private
		 */
		function _handleSyncComplete() {
			//reload
			Rota.$find({filter: {archived: false}}).then(function (rotas) {
				if (rotas.length !== vm.rotas.length) {
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
		 * archive a rota
		 *
		 * @param rota
		 */
		function archive(rota) {
			$ionicListDelegate.closeOptionButtons();
			$ionicPopup.confirm({
				title: 'Are you sure you want to archive this rota?',
				subtitle: 'It will be deactivated',
				okType: 'button-energized'
			}).then(function (ok) {
				if (ok) {
					RotaGeoFenceService.deactivate(rota, true).then(function () {
						rota.archived = true;
						return rota.$save();
					}).then(function () {
						_handleSyncComplete();
					});
				}
			});

		}


		/**
		 * settings
		 *
		 * Display the settings panel using a modal display
		 *
		 * Creates a new $scope and gives it a hide() method so that
		 * the settings view just needs to call hide() to remove
		 * the view
		 *
		 */
		function settings() {
			var $settingsScope = $rootScope.$new(true);

			$settingsScope.hide = function () {
				vm.$settingsModal.hide();
			};

			$ionicModal.fromTemplateUrl('app/rota/settings.html', {
				scope: $settingsScope
			}).then(function (modal) {
				vm.$settingsModal = modal;
				vm.$settingsModal.show();
			})
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

