(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('NewRotaController', NewRotaController);

	NewRotaController.$inject = [
		'$scope',
		'$state',
		'NewRotaService',
		'Rota',
		'ionicDatePicker',
		'ModalSelect',
		'RotaRole',
		'RotaOrganisation',
		'RotaSpeciality'];

	/* @ngInject */
	function NewRotaController($scope,
							   $state,
							   NewRotaService,
							   Rota,
							   ionicDatePicker,
							   ModalSelect,
							   RotaRole,
							   RotaOrganisation,
							   RotaSpeciality) {
		var vm = this;

		vm.BANDING = Rota.BANDING_OPTIONS;

		vm.rota = NewRotaService.create($scope);

		vm.role = {};
		vm.organisation = {};
		vm.speciality = {};

		vm.save = save;
		vm.selectOrganisation = selectOrganisation;
		vm.selectRole = selectRole;
		vm.selectSpeciality = selectSpeciality;
		vm.selectStart = selectStart;
		vm.selectEnd = selectEnd;
		vm.clearEnd = clearEnd;


		////////////////////////////////////////////////////////////////

		// Function Definitions

		////////////////////////////////////////////////////////////////

		/**
		 * save
		 *
		 * Saves a rota and progresses to next screen
		 */
		function save() {
			$state.go('app.new-location');
		}

		/**
		 * selectOrganisation
		 *
		 * Open a modal box to select an organisation
		 *
		 */
		function selectOrganisation() {
			ModalSelect.show({
				items: RotaOrganisation.$find({orderBy: 'name'}),
				selected: vm.rota.organisation,
				title: 'Select Organisation',
				callback: function (value) {
					vm.rota.organisation = value;
					vm.rota.$getRel('organisation').then(function (organisation) {
						vm.organisation = organisation;
					});
				}
			}, this);
		}

		function selectRole() {
			ModalSelect.show({
				items: RotaRole.$find({orderBy: 'title'}),
				selected: vm.rota.role,
				title: 'Select Role',
				nameKey: 'title',
				callback: function (value) {
					vm.rota.role = value;
					vm.rota.$getRel('role').then(function (role) {
						vm.role = role;
					});
				}
			}, this);
		}

		function selectSpeciality() {
			ModalSelect.show({
				items: RotaSpeciality.$find({orderBy: 'title'}),
				selected: vm.rota.speciality,
				title: 'Select Speciality',
				nameKey: 'title',
				callback: function (value) {
					vm.rota.speciality = value;
					vm.rota.$getRel('speciality').then(function (speciality) {
						vm.speciality = speciality;
					});
				}
			}, this);
		}

		/**
		 *
		 * Select Start Date
		 *
		 */
		function selectStart() {
			ionicDatePicker.openDatePicker({
				inputDate: vm.rota.dateStart,
				callback: function (val) {
					vm.rota.dateStart = val;
				}
			});
		}

		function selectEnd() {
			ionicDatePicker.openDatePicker({
				inputDate: vm.rota.dateEnd || new Date(),
				callback: function (val) {
					vm.rota.dateEnd = val;
				}
			});
		}

		function clearEnd(event) {
			vm.rota.dateEnd = null;
		}


	}

})();

