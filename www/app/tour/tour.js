(function () {
	'use strict';

	angular
		.module('saferota.tour')
		.controller('TourController', TourController);

	TourController.$inject = ['TourService', '$ionicSlideBoxDelegate'];

	/* @ngInject */
	function TourController(TourService, $ionicSlideBoxDelegate) {
		var vm = this;


		//Interface
		vm.activate = activate;
		vm.slideHasChanged = slideHasChanged;
		vm.next = next;
		vm.done = done;


		//Start
		vm.activate();


		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		/**
		 * activate
		 *
		 *
		 */
		function activate() {
			vm.doneButton = '';
			vm.slideHasChanged(0);
		}

		/**
		 * next
		 *
		 * Advances the slides
		 *
		 */
		function next() {
			$ionicSlideBoxDelegate.next();
		}

		/**
		 * done
		 *
		 * hide the tour
		 *
		 */
		function done() {
			TourService.hide(true);
		}

		/**
		 * slideHasChanged
		 *
		 * callback for a slide change
		 *
		 * @param index
		 */
		function slideHasChanged(index) {
			if (index < 3) {
				vm.doneButton = 'Skip';
			} else {
				vm.doneButton = 'Done';
			}
		}
	}

})();

