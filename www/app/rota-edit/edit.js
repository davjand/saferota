(function () {
	'use strict';

	angular
		.module('saferota.rota-edit')
		.controller('EditRotaController', EditRotaController);

	EditRotaController.$inject = [
		'$scope',
		'EditRotaService',
		'$state',
		'rotaToEdit',
		'$ionicHistory'
	];

	/* @ngInject */
	function EditRotaController($scope,
								EditRotaService,
								$state,
								rotaToEdit,
								$ionicHistory) {
		var vm = this;

		vm.save = save;
		vm.cancel = cancel;

		vm.rota = rotaToEdit;
		vm.rota.$register($scope);
		EditRotaService.startEdit(vm.rota);

		/**
		 * Save the edit and go to the location
		 */
		function save() {
			$state.go('app.edit-location', {rotaId: vm.rota.getKey()});
		}

		/**
		 * cancel
		 *
		 * Cancel the edit
		 */
		function cancel() {
			if ($ionicHistory.backView() === null) {
				$ionicHistory.nextViewOptions({
					historyRoot: true
				});
				$state.go('app.list');
			} else {
				$ionicHistory.goBack();
			}
		}
	}

})();

