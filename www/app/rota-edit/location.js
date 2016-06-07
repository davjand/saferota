(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('EditLocationPickerController', EditLocationPickerController);

	EditLocationPickerController.$inject = [
		'$scope',
		'$ionicHistory',
		'rotaToEdit',
		'locationToEdit'];

	/* @ngInject */
	function EditLocationPickerController($scope,
										  $ionicHistory,
										  rotaToEdit,
										  locationToEdit) {
		var vm = this;
		
		vm.rota = null;
		vm.location = null;
		vm.done = done;

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
			vm.rota = rotaToEdit.$register($scope);
			vm.location = locationToEdit.$register($scope);
		}


		/**
		 * Save
		 */
		function done() {
			vm.location.$save().then(function () {
				$ionicHistory.goBack();
			})
		}

	}
})();

