(function () {
	'use strict';
	
	angular
		.module('saferota.rota-new')
		.controller('NewRotaSettingsController', NewRotaSettingsController);
	
	NewRotaSettingsController.$inject = [
		'NewRotaService',
		'$scope',
		'$state',
		'$ionicHistory'];
	
	/* @ngInject */
	function NewRotaSettingsController(NewRotaService,
									   $scope,
									   $state,
									   $ionicHistory) {
		var vm = this;
		
		vm.rota = null;
		
		vm.back = back;
		vm.save = save;
		
		activate();
		
		////////////////
		
		function activate() {
			vm.rota = NewRotaService.rota;
			if (!vm.rota) {
				$ionicHistory.nextViewOptions({historyRoot: true});
				$state.go('app.new');
			} else {
				vm.rota.$register($scope);
			}
		}
		
		/**
		 * go back
		 */
		function back() {
			NewRotaService.back();
		}
		
		/**
		 * Save
		 */
		function save() {
			if (!vm.rota.adjustShiftEnd) {
				vm.rota.adjustShiftEnd = 0;
			}
			if (!vm.rota.adjustShiftStart) {
				vm.rota.adjustShiftStart = 0;
			}
			if (!vm.rota.defaultShiftLength) {
				vm.rota.defaultShiftLength = 8;
			}
			NewRotaService.next();
		}
	}
	
})();

