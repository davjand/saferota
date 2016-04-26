(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('NewRotaController', NewRotaController);

	NewRotaController.$inject = [
		'RotaService',
		'ionicDatePicker',
		'ModalSelect',
		'RotaDataService'];

	/* @ngInject */
	function NewRotaController(RotaService,
							   ionicDatePicker,
							   ModalSelect,
							   RotaDataService) {
		var vm = this;

		vm.BANDING = [
			{name: 'None', value: 0},
			{name: '1c', value: 30},
			{name: '1b', value: 40},
			{name: '1a', value: 50}
		];

		vm.data = {
			organisation: null,
			speciality: null,
			role: null,
			label: '',
			hours: 40,
			dateStart: new Date(),
			dateEnd: null,
			banding: vm.BANDING[0]
		};


		vm.selectOrganisation = selectOrganisation;
		vm.selectRole = selectRole;
		vm.selectSpeciality = selectSpeciality;
		vm.selectStart = selectStart;
		vm.selectEnd = selectEnd;
		vm.clearEnd = clearEnd;


		activate();


		////////////////////////////////////////////////////////////////

		// Function Definitions

		////////////////////////////////////////////////////////////////

		function activate() {

		}


		/**
		 * selectOrganisation
		 *
		 * Open a modal box to select an organisation
		 *
		 */
		function selectOrganisation() {
			ModalSelect.show({
				items: RotaDataService.Organisations.get(),
				selected: vm.data.organisation,
				title: 'Select Organisation',
				callback: function (value) {
					vm.data.organisation = value;
				}
			});
		}

		function selectRole() {

		}

		function selectSpeciality() {

		}

		function selectStart() {
			ionicDatePicker.openDatePicker({
				inputDate: vm.data.dateStart,
				callback: function (val) {
					vm.data.dateStart = val;
				}
			});
		}

		function selectEnd() {
			ionicDatePicker.openDatePicker({
				inputDate: vm.data.dateEnd || new Date(),
				callback: function (val) {
					vm.data.dateEnd = val;
				}
			});
		}

		function clearEnd(event) {
			vm.data.dateEnd = null;
		}


	}

})();

