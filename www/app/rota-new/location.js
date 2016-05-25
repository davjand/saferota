(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('NewLocationPickerController', NewLocationPickerController);

	NewLocationPickerController.$inject = [
		'$scope',
		'NewRotaService',
		'$state',
		'$ionicHistory'];

	/* @ngInject */
	function NewLocationPickerController($scope,
										 NewRotaService,
										 $state,
										 $ionicHistory) {
		var vm = this;

		vm.location = null;
		vm.save = save;

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
			/*
			 * create or get the location
			 */
			if (NewRotaService.locations.length < 1) {
				vm.location = NewRotaService.createLocation($scope);
			} else {
				vm.location = NewRotaService.locations[0];
			}
		}


		/**
		 * Save
		 */
		function save() {
			NewRotaService.complete().then(function (id) {
				$ionicHistory.nextViewOptions({
					historyRoot: true
				});
				$state.go('app.list');
			});
		}

	}
})();

