(function () {
	'use strict';

	angular
		.module('saferota.rota-edit')
		.controller('EditRotaController', EditRotaController);

	EditRotaController.$inject = ['$scope', 'EditRotaService', '$state', 'rotaToEdit'];

	/* @ngInject */
	function EditRotaController($scope, EditRotaService, $state, rotaToEdit) {
		var vm = this;

		vm.save = save;
		vm.rota = rotaToEdit;
		vm.rota.$register($scope);
		EditRotaService.startEdit(vm.rota);

		function save() {
			$state.go('app.edit-location', {rotaId: vm.rota.getKey()});
		}
	}

})();

