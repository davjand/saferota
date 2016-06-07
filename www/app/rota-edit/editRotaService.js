(function () {
	'use strict';

	angular
		.module('saferota.rota-edit')
		.service('EditRotaService', EditRotaService);
	
	EditRotaService.$inject = ['$q', '$rootScope', 'RotaGeoFenceService'];

	/* @ngInject */
	function EditRotaService($q, $rootScope, RotaGeoFenceService) {
		var self = this;

		self.rota = null;
		self.$scope = $rootScope.$new(true);

		self.startEdit = startEdit;
		self.cancelEdit = cancelEdit;
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
			self.$scope.$destroy();
			self.rota = null;
			self.$scope = $rootScope.$new(true);
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
			
			//Save the rota
			return self.rota.$save().then(function () {
				return self.rota.$getRel('locations');
			}).then(function (locations) {
				//Save the locations
				var pArr = [];
				angular.forEach(locations, function (l) {
					pArr.push(l.$save());
				});
				return $q.all(pArr)
			}).then(function () {
				return RotaGeoFenceService.deactivate(self.rota);
			}).then(function () {
				return RotaGeoFenceService.activate(self.rota);
			});
		}

	}

})();

