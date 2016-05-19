(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.service('NewRotaService', NewRotaService);

	NewRotaService.$inject = ['Rota', 'RotaLocation', '$rootScope', '$q', 'Session', 'RotaGeoFenceService'];

	/* @ngInject */
	function NewRotaService(Rota, RotaLocation, $rootScope, $q, Session, RotaGeoFenceService) {

		var self = this;
		var $serviceScope = $rootScope.$new();


		self.rota = null;
		self.locations = [];


		self.complete = complete;
		self.create = create;
		self.createLocation = createLocation;
		//self.cancel = cancel;


		////////////////////////////////////////////////////////

		// Save

		////////////////////////////////////////////////////////

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
			return self.rota;
		}

		/**
		 * createLocation
		 *
		 * Creates a location
		 *
		 * @param $scope
		 * @returns {*}
		 */
		function createLocation($scope) {
			var location = RotaLocation.create({}, $scope);
			location.$register($serviceScope);
			self.locations.push(location);

			return location;
		}

		/**
		 * complete
		 *
		 * Called when the new rota is complete
		 * The rota is saved, the object flushed from memory
		 * A new rota is created ready for a new rota creation
		 *
		 * @returns {Promise} to the rota ID
		 */
		function complete() {
			return self.rota.$save().then(function () {
				return self.rota.$setRel('locations', self.locations);
			})
				.then(RotaGeoFenceService.activate(self.rota))
				.then(function () {

					var id = self.rota.getKey();
					self.rota = null;
					self.locations = [];

					$serviceScope.$destroy();
					$serviceScope = $rootScope.$new(true);

					return $q.when(id);
				});
		}


	}

})();

