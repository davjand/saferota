(function () {
	'use strict';

	angular
		.module('saferota.core')
		.constant('GEO_EVENT', {
			ENTER: 1,
			EXIT: 2,
			BOTH: 3
		})
		.run(geofenceRun)
		.factory('geofence', geofenceFactory);


	var ready, geoFence = {
		api: null,
		ready: function () {
			return ready.promise;
		}
	};

	geofenceRun.$inject = ['$window', '$ionicPlatform', '$q', '$rootScope', 'GEO_EVENT', '$log'];

	/*
	 *
	 * geofence initialization code
	 *
	 * If not available, mock the functionality for testing.
	 *
	 */
	function geofenceRun($window, $ionicPlatform, $q, $rootScope, GEO_EVENT, $log) {
		ready = $q.defer();
		$ionicPlatform.ready(function () {
			if (angular.isObject($window.geofence)) {
				$log.log("Geofence plugin found");

				geoFence.api = $window.geofence;

				/*
				 * Trigger events to $rootScope
				 */
				$window.geofence.onTransitionReceived = function (geofences) {
					$log.log(geofences);
					$rootScope.$emit('GEO_EVENT', geofences)
				};

				$window.geofence.initialize().then(function () {
					$log.log("Geofence plugin initialized");
					ready.resolve();
				}, function (error) {
					$log.log("Geofence plugin error: " + error);
					ready.reject();
				});
			} else {
				$log.warn("Geofence plugin not found: creating mock object");
				/*
				 *
				 * Mock Implementation of Geofence
				 *
				 */
				geoFence.api = {
					addOrUpdate: function () {
						return $q.when();
					},
					remove: function () {
						return $q.when();
					},
					removeAll: function () {
						return $q.when();
					},
					getWatched: function () {
						return $q.when('[]');
					},
					_triggerEvent: function (id, event) {
						$rootScope.$emit('GEO_EVENT', {
							id: id,
							event: event
						});
					}
				};
				ready.resolve();
			}
		});
	}


	geofenceFactory.$inject = [];

	/* @ngInject */
	function geofenceFactory() {
		return geoFence;
	}

})();

