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
		vm.close = close;

		vm.rota = rotaToEdit;
		vm.rota.$register($scope);
		EditRotaService.startEdit(vm.rota);

		/**
		 * save
		 */
		function save() {
			EditRotaService.completeEdit().then(function () {
				vm.close();
			})
		}

		/**
		 * cancel
		 *
		 * Cancel the edit
		 */
		function close() {
			EditRotaService.cancelEdit();

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

