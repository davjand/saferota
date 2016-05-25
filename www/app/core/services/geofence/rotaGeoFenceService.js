(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('RotaGeoFenceService', rotaGeoFenceService);

	rotaGeoFenceService.$inject = [
		'geofence',
		'RotaLocation',
		'$q',
		'$log',
		'$rootScope',
		'APP_MSG'];

	/**
	 * RotaGeoFenceService
	 *
	 * Service to handle interactions between rotas/locations and geofences.
	 *
	 * Handles:
	 *  - All access to geofence API
	 *  - Activating and deactivating geofences
	 *
	 */

	/* @ngInject */
	function rotaGeoFenceService(geofence,
								 RotaLocation,
								 $q,
								 $log,
								 $rootScope,
								 APP_MSG) {

		var self = this;

		self.getActiveLocations = getActiveLocations;

		self.getActiveRotaIds = getActiveRotaIds;
		self.activateLocation = activateLocation;
		self.deactivateLocation = deactivateLocation;
		self.locationIsActive = locationIsActive;

		self.activate = activate;
		self.deactivate = deactivate;
		self.deactivateAll = deactivateAll;
		self.isActive = isActive;


		////////////////

		/**
		 * getActiveLocations
		 *
		 * get a list of active locations
		 *
		 * Uses uniqueIdentifier from location as ID can cahnged
		 *
		 * @returns {Promise}
		 */
		function getActiveLocations() {
			return geofence.ready()
				.then(geofence.api.getWatched)
				.then(function (results) {
					var ids = [];
					angular.forEach(JSON.parse(results), function (item) {
						ids.push(item.id);
					});

					return RotaLocation.$find({
						filter: {
							uniqueIdentifier: ids
						}
					});
				});
		}


		/**
		 * getActiveRotaIds
		 *
		 * get a list of active
		 *
		 *
		 *
		 */
		function getActiveRotaIds() {
			return geofence.ready()
				.then(self.getActiveLocations)
				.then(function (locations) {
					var filter = {
						objectId: []
					};
					if (locations === null || locations.length < 1) {
						return $q.when([]);
					}
					angular.forEach(locations, function (item) {
						filter.objectId.push(item.getKey());
					});
					return RotaLocation.$find({filter: filter});
				}).then(function (locationObjects) {
					var result = [];
					angular.forEach(locationObjects, function (item) {
						if (result.indexOf(item.rota) === -1) {
							result.push(item.rota);
						}
					});
					return $q.when(result);
				});
		}

		/**
		 * locationIsActive
		 *
		 * Returns true/false if the location is active
		 *
		 * @returns {Promise} Promise to boolean
		 */
		function locationIsActive(location) {
			return self.getActiveLocations()
				.then(function (list) {
					var f = false;
					angular.forEach(list, function (item) {
						f = f || location.getKey() === item.getKey();
					});
					return $q.when(f);
				});
		}


		/**
		 * activateLocation
		 *
		 * Activates a location
		 *
		 * @param location
		 * @returns {*}
		 */
		function activateLocation(location) {
			return self.locationIsActive(location)
				.then(function (result) {
					if (result) {
						$log.warn('RotaGeoFenceService: Cannot Activate Location ' + location.uniqueIdentifier + ", already active");
						return $q.when();
					}
					return geofence.api.addOrUpdate({
						id: location.uniqueIdentifier,
						latitude: parseFloat(location.lat),
						longitude: parseFloat(location.long),
						radius: parseFloat(location.radius),
						transitionType: 3
					})
				});
		}

		/**
		 * deactivateLocation
		 *
		 * @param location
		 * @param bypassError
		 * @returns {*}
		 */
		function deactivateLocation(location, bypassError) {
			bypassError = typeof bypassError !== 'undefined' ? bypassError : true;
			return self.locationIsActive(location)
				.then(function (result) {
					if (!result) {
						if (bypassError) {
							return $q.when();
						}
						return $q.reject('RotaGeoFenceService: Cannot Deactivate Location ' + location.uniqueIdentifier + ", is not active");
					}
					return geofence.api.remove(location.uniqueIdentifier)
				})
		}


		/**
		 * activate
		 *
		 * Activate a rota's geofence(s)
		 * Emits a GEO_ACTIVATE event when complete
		 *
		 * @param rota
		 * @returns {*}
		 */
		function activate(rota) {
			return rota.$getRel('locations')
				.then(function (locations) {
					var p = [];
					angular.forEach(locations, function (item) {
						p.push(self.activateLocation(item));
					});
					return $q.all(p);
				}).then(function () {
					$rootScope.$emit(APP_MSG.GEO_ACTIVATE);
					return $q.when();
				});
		}

		/**
		 * deactivate
		 *
		 *
		 * @param rota
		 * @param bypassError {Boolean}
		 *
		 * Deactivate a rota's geofences
		 * Emits a GEO_DEACTIVATE event when complete
		 *
		 * @returns {*}
		 */
		function deactivate(rota, bypassError) {
			return rota.$getRel('locations').then(function (locations) {
				var p = [];
				angular.forEach(locations, function (item) {
					p.push(self.deactivateLocation(item, bypassError));
				});
				return $q.all(p);
			}).then(function () {
				$rootScope.$emit(APP_MSG.GEO_DEACTIVATE);
				return $q.when();
			})
		}

		/**
		 * getActive
		 *
		 * Returns a promise to a boolean
		 *
		 * @param rota
		 */
		function isActive(rota) {
			return rota.$getRel('locations')
				.then(function (locations) {
					return locations.length > 0 ?
						self.locationIsActive(locations[0]) :
						$q.when(false);
				})
		}

		/**
		 * deactivateAll
		 *
		 * Removes any active geofences
		 *
		 * @returns {*}
		 */
		function deactivateAll() {
			return geofence.api.removeAll().then(function () {
				$rootScope.$emit(APP_MSG.GEO_DEACTIVATE);
				return $q.when();
			})
		}
	}

})();

