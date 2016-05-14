(function () {
	'use strict';

	angular
		.module('saferota.rota-edit')
		.service('EditRotaService', EditRotaService);

	EditRotaService.$inject = ['$q', '$rootScope', '$state', 'RotaGeoFenceService'];

	/* @ngInject */
	function EditRotaService($q, $rootScope, $state, RotaGeoFenceService) {
		var self = this;

		self.rota = null;
		self.location = null;
		self.$scope = $rootScope.$new(true);

		self.startEdit = startEdit;
		self.cancelEdit = cancelEdit;
		self.getLocation = getLocation;
		self.completeEdit = completeEdit;


		/**
		 * startEdit
		 *
		 * Called when editing starts to cache the rota;
		 *
		 * @param rota
		 */
		function startEdit(rota) {
			self.rota = rota;
			self.rota.$register(self.$scope);
		}

		/**
		 * cancelEdit
		 *
		 */
		function cancelEdit() {
			self.rota = null;
			self.location = null;
			self.$scope.$destroy();
			self.$scope = $rootScope.$new(true);
		}

		/**
		 * getLocation
		 *
		 *
		 * @returns {*}
		 */
		function getLocation() {
			return self.rota.$getRel('locations').then(function (location) {
				self.location = location[0];
				self.location.$register(self.$scope);
				return $q.when(self.location);
			});
		}

		/**
		 * completeEdit
		 *
		 * Completes the edit
		 * Saves the data
		 * Reactivates the updated rota
		 *
		 * @returns {*}
		 */
		function completeEdit() {
			return $q.all([
				self.rota.$save(),
				self.location ? self.location.$save() : $q.when()
			])
				.then(function () {
					return RotaGeoFenceService.deactivate(self.rota);
				})
				.then(function () {
					return RotaGeoFenceService.activate(self.rota);
				})
				.then(function () {
					self.cancelEdit();
					$state.go('app.list');
					return $q.when();
				})
		}

	}

})();

