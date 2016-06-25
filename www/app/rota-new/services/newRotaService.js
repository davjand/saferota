(function () {
	'use strict';
	
	angular
		.module('saferota.rota-new')
		.service('NewRotaService', NewRotaService);
	
	NewRotaService.$inject = [
		'Rota',
		'RotaLocation',
		'$rootScope',
		'$q',
		'$state',
		'$ionicHistory',
		'$ionicPopup',
		'$ionicLoading',
		'Session',
		'RotaGeoFenceService',
		'GoogleMaps'
	
	];
	
	/* @ngInject */
	function NewRotaService(Rota,
							RotaLocation,
							$rootScope,
							$q,
							$state,
							$ionicHistory,
							$ionicPopup,
							$ionicLoading,
							Session,
							RotaGeoFenceService,
							GoogleMaps) {
		
		var self = this;
		var $serviceScope = $rootScope.$new();
		
		var STATES = {
			START:    0,
			LOCATION: 1,
			SETTINGS: 2,
			COMPLETE: 3
		};
		
		//rota and location data
		self.rota = null;
		self.locations = [];
		
		//states
		self.STATES = STATES;
		self.state = self.STATES.START;
		self.currentLocationState = null;
		self.shownLocationHelp = false;
		
		//General
		self.start = start;
		self.cancel = cancel;
		self.saveAndActivate = saveAndActivate;
		self.complete = complete;
		self.clear = clear;
		
		//Navigation
		self.next = next;
		self.back = back;
		
		//Rota
		self.getOrCreate = getOrCreate;
		self.create = create;
		
		//Location
		self.createLocation = createLocation;
		self.changeLocationState = changeLocationState;
		self.getCurrentLocation = getCurrentLocation;
		self.showLocationHelp = showLocationHelp;
		
		
		////////////////////////////////////////////////////////
		
		// Function Definitions
		
		////////////////////////////////////////////////////////

		/**
		 * start a new rota session
		 *
		 * @param $scope
		 * @returns {*}
		 */
		function start($scope) {
			self.state = self.STATES.START;
			self.currentLocationState = null;
			self.shownLocationHelp = false;
			
			//do google maps check
			GoogleMaps.continueIfLoadedOrPrompt(
				function () {
				},
				function () {
					self.cancel();
				});
			
			return self.getOrCreate($scope);
		}
		
		/**
		 * cancel the creation and go back
		 */
		function cancel() {
			self.clear();
			$ionicHistory.goBack();
		}
		
		/**
		 * if already exists, return the rota object. Otherwise
		 * create a new one
		 *
		 * @param $scope
		 * @returns {*}
		 */
		function getOrCreate($scope) {
			if (!self.rota) {
				return self.create($scope);
			} else {
				self.rota.$register($scope);
				return self.rota;
			}
		}
		
		/**
		 * create
		 *
		 * Creates a rota
		 * Caches it within the service
		 * Registers a new scope so can recieve updates
		 *
		 * @param $scope
		 * @returns {Rota}
		 */
		function create($scope) {
			self.rota = Rota.create({user: Session.user.objectId}, $scope);
			self.rota.$register($serviceScope);
			self.locations = [];
			return self.rota;
		}
		
		/**
		 * createLocation
		 *
		 * Creates a location
		 *
		 * @returns {RotaLocation}
		 */
		function createLocation() {
			var location = RotaLocation.create();
			location.generateUID();
			location.$register($serviceScope);
			self.locations.push(location);
			return location;
		}
		
		/**
		 * saveAndActivate
		 *
		 * Called when the new rota is complete
		 * The rota is saved, the object flushed from memory
		 * A new rota is created ready for a new rota creation
		 *
		 * @returns {Promise}
		 */
		function saveAndActivate() {
			return self.rota.$save().then(function () {
				return self.rota.$setRel('locations', self.locations);
			})
				.then(function () {
					return RotaGeoFenceService.activate(self.rota);
				});
		}
		
		/**
		 * complete
		 *
		 * clears the controller and redirects
		 *
		 */
		function complete() {
			$ionicHistory.nextViewOptions({
				historyRoot: true
			});
			
			if (!self.rota) {
				self.clear();
				$state.go('app.list');
			} else {
				var id = self.rota.getKey();
				self.clear();
				$state.go('app.view.logs', {rotaId: id});
			}
		}
		
		/**
		 *
		 * clear the current session
		 *
		 */
		function clear() {
			$serviceScope.$destroy();
			$serviceScope = $rootScope.$new(true);
			self.rota = null;
			self.locations = [];
			self.currentLocationState = 0;
			self.shownLocationHelp = false;
		}
		
		/**
		 * get the current active location
		 * @returns {*}
		 */
		function getCurrentLocation() {
			return self.locations[self.currentLocationState];
		}
		
		/**
		 * change the state to the location given in the index
		 *
		 * @param locationIndex
		 */
		function changeLocationState(locationIndex) {
			self.currentLocationState = locationIndex;
			self.state = STATES.LOCATION;
			$state.go('app.new-location', {
				locationId: self.locations[locationIndex].getKey()
			});
		}
		
		
		/**
		 * next
		 *
		 * Navigates to the next view when creating a new rota
		 *
		 */
		function next() {
			switch (self.state) {
				case STATES.START:
					if (self.locations.length < 1) {
						self.createLocation();
					}
					self.changeLocationState(0);
					break;
				case STATES.LOCATION:
					if (self.currentLocationState + 1 < self.locations.length) {
						self.changeLocationState(
							++self.currentLocationState
						);
					} else {
						self.state = STATES.SETTINGS;
						self.currentLocationState = null;
						$state.go('app.new-settings');
					}
					break;
				case STATES.SETTINGS:
					$ionicLoading.show();
					self.saveAndActivate().then(function () {
						$ionicLoading.hide();
						self.state = STATES.COMPLETE;
						$state.go('app.new-complete');
					});
					break;
			}
		}
		
		
		/**
		 * back
		 *
		 */
		function back() {
			switch (self.state) {
				case STATES.START:
					self.cancel();
					break;
				case STATES.LOCATION:
					if (self.currentLocationState > 0) {
						self.currentLocationState--;
					} else {
						self.state = STATES.START;
						self.currentLocationState = null;
					}
					$ionicHistory.goBack();
					break;
				case STATES.SETTINGS:
					self.currentLocationState = self.locations.length - 1;
					self.state = STATES.LOCATION;
					$ionicHistory.goBack();
					break;
			}
		}
		
		/**
		 *
		 * show location help text
		 *
		 */
		function showLocationHelp() {
			if (!self.shownLocationHelp) {
				self.shownLocationHelp = true;
				$ionicPopup.show({
					title:       'Add Workplace',
					templateUrl: 'app/rota-new/services/locationHelp.html',
					buttons:     [{text: 'Got it!', type: 'button-balanced'}]
				});
			}
		}
		
	}
	
})();

