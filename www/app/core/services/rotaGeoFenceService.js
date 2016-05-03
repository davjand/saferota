(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('RotaGeoFenceService', rotaGeoFenceService);

	rotaGeoFenceService.$inject = ['geofence', 'RotaLocation', 'Rota', '$q'];

	/*
	 * Spec
	 *
	 * [X] getActiveGeofences - Get a list of active locations
	 * [X] getActiveRotas - Get a list of active rotas
	 * [X] activateLocation(location) - Activate a location
	 * [X] deactivateLocation(location) - Deactivates the location
	 * [X] locationIsActive(location) - true/false if active
	 *
	 * [X] rotaIsActive(Rota) - true/false if active
	 * [X] activate(Rota) - activates all locations in a rota
	 * [X] deactivate(Rota) - deactivates all locations in a rota
	 *
	 * [ ] Emits an event when the geofence transitionTo callback is called.
	 */

	/* @ngInject */
	function rotaGeoFenceService(geofence,
								 RotaLocation,
								 Rota,
								 $q) {

		var self = this;

		self.getActiveLocations = getActiveLocations;

		self.getActiveRotaIds = getActiveRotaIds;
		self.activateLocation = activateLocation;
		self.deactivateLocation = deactivateLocation;
		self.locationIsActive = locationIsActive;

		self.activate = activate;
		self.deactivate = deactivate;
		self.isActive = isActive;


		////////////////

		/**
		 * getActiveLocations
		 *
		 * get a list of active locations
		 * @returns {Promise}
		 */
		function getActiveLocations() {
			return geofence.ready()
				.then(geofence.api.getWatched)
				.then(function (results) {
					return JSON.parse(results);
				});
		}


		/**
		 * getActiveRotaIds
		 *
		 * get a list of active
		 *
		 */
		function getActiveRotaIds() {
			return geofence.ready()
				.then(self.getActiveLocations())
				.then(function (locations) {
					var filter = {
						objectId: []
					};
					angular.forEach(locations, function (item) {
						objectId.push(item.id)
					});
					return RotaLocation.$find(filter);
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
						f = f || location.getKey() === item.id;
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
						return $q.reject('RotaGeoFenceService: Cannot Activate Location ' + location.getKey() + ", already active");
					}
					return geofence.api.addOrUpdate({
						id: location.getKey(),
						latitude: parseFloat(location.lat),
						longitude: parseFloat(location.long),
						radius: parseFloat(location.radius),
						transitionType: 3
					})
				})
		}

		function deactivateLocation(location) {
			return self.locationIsActive(location)
				.then(function (result) {
					if (!result) {
						return $q.reject('RotaGeoFenceService: Cannot Deactivate Location ' + location.getKey() + ", is not active");
					}
					return geofence.api.remove(location.getKey())
				})
		}


		function activate(rota) {
			return rota.$getRel('locations').then(function (locations) {
				var p = [];
				angular.forEach(locations, function (item) {
					p.push(self.activateLocation(item));
				});
				return $q.all(p);
			});
		}

		function deactivate(rota) {
			return rota.$getRel('locations').then(function (locations) {
				var p = [];
				angular.forEach(locations, function (item) {
					p.push(self.deactivateLocation(item));
				});
				return $q.all(p);
			});
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
	}

})();

