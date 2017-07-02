(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('RotaListController', RotaListController);

	RotaListController.$inject = [
		'$state',
		'$scope',
		'$rootScope',
		'DATA_EVENTS',
		'$ionicPopup',
		'Rota',
		'$ionicListDelegate',
		'RotaGeoFenceService',
		'$ionicLoading',
		'APP_MSG',
		'SettingsService',
		'$log'
	];

	/* @ngInject */
	function RotaListController($state,
								$scope,
								$rootScope,
								DATA_EVENTS,
								$ionicPopup,
								Rota,
								$ionicListDelegate,
								RotaGeoFenceService,
								$ionicLoading,
								APP_MSG,
								SettingsService,
								$log) {
		var vm = this;


		/*
		 *
		 * Interface
		 *
		 */

		//Constructors
		vm.up = up;
		vm.down = down;

		//Data loading
		vm.loadRotas = loadRotas;
		vm.loadActiveRotas = loadActiveRotas;

		//Rota Interactions
		vm.archive = archive;
		vm.edit = edit;
		vm.isActive = isActive;
		vm.activate = activateRota;
		vm.deactivate = deactivate;
		vm.selectRota = selectRota;
		vm.settings = settings;
		
		//Test
		vm._testGeofenceService = _testGeofenceService;


		//Internal
		var _listeners;
		
		vm.up();


		////////////////////////////////////////////////

		//Function Definitions

		////////////////////////////////////////////////

		/**
		 * activate
		 *
		 * Constructor Function
		 *
		 */
		function up() {
			/*
			 *
			 * Variables
			 *
			 */
			vm.rotas = [];
			vm.activeRotas = [];


			/*
			 *
			 * Setup listeners
			 *
			 */
			_listeners = [
				$rootScope.$on(APP_MSG.GEO_ACTIVATE, vm.loadActiveRotas),
				$rootScope.$on(APP_MSG.GEO_DEACTIVATE, vm.loadActiveRotas),
				$rootScope.$on(DATA_EVENTS.SYNC_FINISH, vm.loadRotas),
				Rota.on('new', vm.loadRotas)
			];

			/*
			 * Setup destructor
			 */
			$scope.$on('$destroy', vm.down);


			/*
			 *
			 * Load Data
			 *
			 */
			vm.loading = true;
			vm.loadRotas()
				.then(vm.loadActiveRotas);


		}


		/**
		 * down
		 *
		 * Destructor function
		 *
		 */
		function down() {
			//Unbind listeners
			angular.forEach(_listeners, function (l) {
				l();
			});
		}


		/**
		 * loadRotas
		 *
		 * @private
		 */
		function loadRotas() {
			return Rota.$find({filter: {archived: false}, orderBy: 'label'}, $scope).then(function (rotas) {
				vm.loading = false;
				if (rotas.length !== vm.rotas.length) {
					vm.rotas = rotas;
				}
			});
		}


		/**
		 * loadActiveRotas
		 *
		 *
		 * @returns {*}
		 */
		function loadActiveRotas() {
			return RotaGeoFenceService.getActiveRotaIds().then(function (activeIds) {
				vm.activeRotas = [];
				angular.forEach(vm.rotas, function (rota) {
					if (activeIds.indexOf(rota.getKey()) !== -1) {
						vm.activeRotas.push(rota);
					}
				});
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
			//noinspection JSUnresolvedFunction
			$ionicListDelegate.closeOptionButtons();
			$state.go('app.edit', {rotaId: rota.getKey()});
		}

		/**
		 * archive a rota
		 *
		 * @param rota
		 */
		function archive(rota) {
			//noinspection JSUnresolvedFunction
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
						vm.loadRotas();
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
			SettingsService.show();
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
			var flag = false;
			angular.forEach(vm.activeRotas, function (r) {
				flag = flag || r.getKey() === rota.getKey();
			});
			return flag;
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
				.then(function () {
					//noinspection JSUnresolvedFunction
					$ionicListDelegate.closeOptionButtons();
					$ionicLoading.hide();
				}, function (error) {
					handleError(error, 'Cannot activate rota - please ensure location services and notifications are enabled')
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
				.then(function () {
					//noinspection JSUnresolvedFunction
					$ionicListDelegate.closeOptionButtons();
					$ionicLoading.hide();
				}, function (error) {
					handleError(error, 'Cannot deactivate rota')
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
		
		/**
		 * handleError
		 *
		 * @param error
		 * @param msg
		 */
		function handleError(error, msg) {
			$ionicLoading.hide();
			$log.error(JSON.stringify(error));
			$ionicPopup.alert({
				title:    'Error',
				subTitle: msg,
				okType:   'button-energized'
			});
		}
		
		
		/**
		 * Testing functionality
		 * @private
		 */
		function _testGeofenceService() {
			RotaGeoFenceService._callTest();
		}

	}

})();

