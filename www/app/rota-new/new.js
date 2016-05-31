(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('NewRotaController', NewRotaController);

	NewRotaController.$inject = [
		'$rootScope',
		'UI_EVENTS',
		'$scope',
		'$state',
		'$ionicPopup',
		'NewRotaService'
	];

	/* @ngInject */
	function NewRotaController($rootScope,
							   UI_EVENTS,
							   $scope,
							   $state,
							   $ionicPopup,
							   NewRotaService) {
		var vm = this;

		vm.save = save;
		vm.cancel = cancel;
		vm.activate = activate;
		vm.deactivate = deactivate;


		activate();

		////////////////////////////////////////////////////////////////

		// Function Definitions

		////////////////////////////////////////////////////////////////


		/**
		 * activate
		 *
		 * Gets a new rota
		 *
		 * shows the keyboard accessory
		 *
		 */
		function activate() {

			//deactivate when closed
			$scope.$on('$destroy', vm.deactivate);
			
			//$rootScope.$emit(UI_EVENTS.KEYBOARD_ACCESSORY_SHOW);

			if (NewRotaService.rota) {
				vm.rota = NewRotaService.rota;
				vm.rota.$register($scope);
			} else {
				vm.rota = NewRotaService.create($scope);
			}
		}

		/**
		 * deactivate
		 *
		 * re hides the keyboard accessory
		 *
		 */
		function deactivate() {
			//$rootScope.$emit(UI_EVENTS.KEYBOARD_ACCESSORY_HIDE);
		}


		/**
		 * save
		 *
		 * Saves a rota and progresses to next screen
		 */
		function save() {
			if (!vm.rota.isValid()) {
				$ionicPopup.alert({
					title: 'Please enter a Rota Name, Speciality and Role',
					okType: 'button-balanced'
				})
			} else {
				$state.go('app.new-location');
			}

		}

		function cancel() {
			$state.go('app.list');
		}
	}

})();

