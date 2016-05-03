(function () {
	'use strict';

	angular
		.module('saferota.rota-edit')
		.service('EditRotaService', EditRotaService);

	EditRotaService.$inject = ['$q', '$rootScope', '$state'];

	/* @ngInject */
	function EditRotaService($q, $rootScope, $state) {
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

		function cancelEdit() {
			self.rota = null;
			self.location = null;
			self.$scope.$destroy();
			self.$scope = $rootScope.$new(true);
		}

		function getLocation() {
			return self.rota.$getRel('locations').then(function (location) {
				self.location = location[0];
				self.location.$register(self.$scope);
				return $q.when(self.location);
			});
		}

		function completeEdit() {
			return $q.all([
				self.rota.$save(),
				self.location ? self.location.$save() : $q.when()
			]).then(function () {
				self.cancelEdit();
				return $q.when();
			})
		}

	}

})();

