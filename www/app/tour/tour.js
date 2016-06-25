(function () {
	'use strict';

	angular
		.module('saferota.tour')
		.controller('TourController', TourController);
	
	TourController.$inject = ['TourService', '$scope', '$timeout'];

	/* @ngInject */
	function TourController(TourService, $scope, $timeout) {
		var vm = this;
		vm.slider = {};

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
			
			//let the directives init
			$timeout(function () {
				vm.slider.on("slideChangeEnd", function (slider) {
					// note: the indexes are 0-based
					vm.slideHasChanged(slider.activeIndex);
					$scope.$apply();
				});
			}, 100);

		}

		/**
		 * next
		 *
		 * Advances the slides
		 *
		 */
		function next() {
			vm.slider.slideNext();
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

