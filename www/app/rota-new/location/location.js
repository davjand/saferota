(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('NewLocationController', NewLocationController);
	
	NewLocationController.$inject = [
		'$scope',
		'$state',
		'$ionicPopup',
		'$ionicHistory',
		'NewRotaService'
	];

	/* @ngInject */
	function NewLocationController($scope,
								   $state,
								   $ionicPopup,
								   $ionicHistory,
								   NewRotaService) {
		var vm = this;
		
		//Variables
		vm.location = null;
		
		//Functions
		vm.save = save;
		vm.back = back;

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
			vm.location = NewRotaService.getCurrentLocation();
			if (!vm.location) {
				//error, redirect back
				$ionicHistory.nextViewOptions({historyRoot: true});
				$state.go('app.new');
			} else {
				vm.location.$register($scope);
				NewRotaService.showLocationHelp();
			}

		}


		/**
		 * Save
		 */
		function save() {
			$ionicPopup.confirm({
				title:      'Add another location?',
				subTitle:   'You can add multiple locations to track per rota',
				okText:     'No',
				okType:     'button-balanced',
				cancelText: 'Yes',
				cancelType: 'button-subtle'
			}).then(function (result) {
				if (!result) {
					NewRotaService.createLocation();
				}
				NewRotaService.next();
			})
		}
		
		function back() {
			NewRotaService.back();
		}

	}
})();

