(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('EditLocationPickerController', EditLocationPickerController);

	EditLocationPickerController.$inject = [
		'$scope',
		'EditRotaService',
		'$ionicLoading',
		'$state',
		'$ionicHistory',
		'rotaToEdit'];

	/* @ngInject */
	function EditLocationPickerController($scope,
										  EditRotaService,
										  $ionicLoading,
										  $state,
										  $ionicHistory,
										  rotaToEdit) {
		var vm = this;

		vm.location = null;
		vm.save = save;
		//vm.cancel = cancel;

		activate();


		//////////////////////////////////////////////

		// Function Definitions

		//////////////////////////////////////////////

		/**
		 * activate
		 *
		 * Initialiser
		 */
		function activate() {
			$ionicLoading.show();

			if (!EditRotaService.rota) {
				EditRotaService.startEdit(rotaToEdit);
			}

			EditRotaService.getLocation().then(function (location) {
				$ionicLoading.hide();
				vm.location = location;
				vm.location.$register($scope);
			})
		}


		/**
		 * Save
		 */
		function save() {
			var id = EditRotaService.rota.getKey();

			EditRotaService.completeEdit().then(function () {

				var history = $ionicHistory.viewHistory();

				if (Object.keys(history.views).length > 2) {
					$ionicHistory.goBack(-2);
				} else {
					$ionicHistory.nextViewOptions({historyRoot: true});
					$state.go('app.list', {rotaId: id});
				}


			});
		}

	}
})();

