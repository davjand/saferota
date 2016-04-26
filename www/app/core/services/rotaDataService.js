(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('RotaDataService', RotaDataService);

	/**
	 * RotaDataService
	 *
	 * Facade wrapper for organisations/roles/specialities
	 * data retrieval functions
	 *
	 */


	RotaDataService.$inject = [
		'RotaOrganisationService',
		'RotaRoleService',
		'RotaSpecialityService'];

	/* @ngInject */
	function RotaDataService(RotaOrganisationService,
							 RotaRoleService,
							 RotaSpecialityService) {
		var self = this;

		self.Roles = RotaRoleService;
		self.Specialities = RotaSpecialityService;
		self.Organisations = RotaOrganisationService;

	}

})();

