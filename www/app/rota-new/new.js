(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('NewRotaController', NewRotaController);

	NewRotaController.$inject = [
		'$scope',
		'$state',
		'$ionicHistory',
		'NewRotaService',
		'Rota',
		'ionicDatePicker',
		'ModalSelect',
		'RotaRole',
		'RotaOrganisation',
		'RotaSpeciality'];

	/* @ngInject */
	function NewRotaController($scope,
							   $state,
							   $ionicHistory,
							   NewRotaService) {
		var vm = this;

		vm.rota = NewRotaService.create($scope);

		vm.save = save;
		vm.cancel = cancel;
		

		////////////////////////////////////////////////////////////////

		// Function Definitions

		////////////////////////////////////////////////////////////////

		/**
		 * save
		 *
		 * Saves a rota and progresses to next screen
		 */
		function save() {
			$state.go('app.new-location');
		}

		function cancel() {
			$state.go('app.list');
		}
	}

})();

