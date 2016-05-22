(function () {
	'use strict';

	angular
		.module('saferota.tour')
		.service('TourService', TourService);

	TourService.$inject = ['$ionicModal', 'Cache', '$q'];

	/* @ngInject */
	function TourService($ionicModal, Cache, $q) {
		var self = this;

		self.showIfFirstTime = showIfFirstTime;
		self.show = show;
		self.hide = hide;
		self.hasBeenShown = hasBeenShown;
		self.resetTour = resetTour;

		self.$modal = null;

		var TOUR_CACHE = 'tourFinished';

		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		/**
		 * showIfFirstTime
		 *
		 * Shows the tour, only if not been shown before
		 *
		 */
		function showIfFirstTime() {
			if (self.hasBeenShown() !== true) {
				self.show();
			}
		}

		/**
		 * show the tour
		 *
		 * @returns {*}
		 */
		function show() {
			return (self.$modal ? self.$modal.remove() : $q.when())
				.then(function () {
					return $ionicModal.fromTemplateUrl(
						'app/tour/tour.html', {}
					);
				}).then(function (modal) {
					self.$modal = modal;
					self.$modal.show();
				});
		}

		/**
		 * hide
		 *
		 * Hide the tour
		 *
		 * @param setCache {Boolean} - Sets the tour cache to 1 to indicate tour has been shown
		 *
		 * @returns {*}
		 */
		function hide(setCache) {
			if (!self.$modal) {
				return $q.when();
			} else {
				return self.$modal.remove().then(function () {
					self.$modal = null;
					if (setCache) {
						Cache.put(TOUR_CACHE, true);
					}
				})
			}
		}

		/**
		 * hasBeenShown
		 *
		 * Checks the cache and returns true if the tour has been shown before
		 *
		 * @returns {*}
		 */
		function hasBeenShown() {
			return Cache.get(TOUR_CACHE);
		}

		/**
		 * resetTour
		 *
		 * Sets the tour flag in cache to false
		 *
		 * @returns {*}
		 */
		function resetTour() {
			return Cache.put(TOUR_CACHE, false);
		}


	}

})();

