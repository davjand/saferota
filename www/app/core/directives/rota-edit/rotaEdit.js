(function () {
	'use strict';

	angular
		.module('saferota.core')
		.directive('rotaEdit', rotaEdit);

	rotaEdit.$inject = [];

	/* @ngInject */
	function rotaEdit() {
		return {
			controller: RotaEditController,
			controllerAs: 'vm',
			link: link,
			templateUrl: 'app/core/directives/rota-edit/rotaEdit.html',
			scope: {
				rota: '='
			}
		};

		function link(scope, element, attrs) {

		}
	}

	RotaEditController.$inject = [
		'$scope',
		'moment',
		'Rota',
		'ionicDatePicker',
		'ModalSelect',
		'RotaRole',
		'RotaOrganisation',
		'RotaSpeciality'
	];

	/* @ngInject */
	function RotaEditController($scope,
								moment,
								Rota,
								ionicDatePicker,
								ModalSelect,
								RotaRole,
								RotaOrganisation,
								RotaSpeciality) {
		var vm = this;

		/*
		 * Module Definition
		 */
		vm.selectOrganisation = selectOrganisation;
		vm.selectRole = selectRole;
		vm.selectSpeciality = selectSpeciality;
		vm.selectStart = selectStart;
		vm.selectEnd = selectEnd;
		vm.clearEnd = clearEnd;

		activate();


		/**
		 * activate
		 *
		 */
		function activate() {
			vm.BANDING = Rota.BANDING_OPTIONS;
			vm.rota = $scope.rota;
			vm.valid = false;

			vm.role = {};
			vm.organisation = {};
			vm.speciality = {};

			_getRel('role');
			_getRel('organisation');
			_getRel('speciality');
		}


		/**
		 * _getRel
		 *
		 * Shortcut to get the relation
		 *
		 * Sets the object vm[relation] from the result of vm.rota.$getRel(relation)
		 *
		 * @param key {String}
		 */
		function _getRel(key) {
			if (vm.rota[key]) {
				vm.rota.$getRel(key).then(function (result) {
					vm[key] = result;
				});
			}
		}


		/**
		 * selectOrganisation
		 *
		 * Opens a select picker to select the Organisation
		 *
		 * @param $event
		 */
		function selectOrganisation($event) {
			$event.preventDefault();
			ModalSelect.show({
				items: RotaOrganisation.$find({orderBy: 'name'}),
				selected: vm.rota.organisation,
				title: 'Select Organisation',
				callback: function (value) {
					vm.rota.organisation = value;
					_getRel('organisation');
				}
			}, this);
		}

		/**
		 * selectRole
		 *
		 * Opens a select picker to select the Role
		 *
		 * @param $event
		 *
		 */
		function selectRole($event) {
			$event.preventDefault();
			ModalSelect.show({
				items: RotaRole.$find({orderBy: 'title'}),
				selected: vm.rota.role,
				title: 'Select Role',
				nameKey: 'title',
				callback: function (value) {
					vm.rota.role = value;
					_getRel('role');
				}
			}, this);
		}


		/**
		 * selectSpeciality
		 *
		 * Opens a select picker to select the speciality
		 *
		 * @param $event
		 */
		function selectSpeciality($event) {
			$event.preventDefault();
			ModalSelect.show({
				items: RotaSpeciality.$find({orderBy: 'title'}),
				selected: vm.rota.speciality,
				title: 'Select Speciality',
				nameKey: 'title',
				callback: function (value) {
					vm.rota.speciality = value;
					_getRel('speciality');
				}
			}, this);
		}

		/**
		 * selectStart
		 *
		 * Opens a date picker to select the start date
		 *
		 */
		function selectStart() {
			ionicDatePicker.openDatePicker({
				inputDate: new Date(vm.rota.dateStart),
				callback: function (val) {
					vm.rota.dateStart = moment(val).valueOf();
				}
			});
		}

		/**
		 * SelectEnd
		 *
		 * Opens a date picker to select the end date
		 *
		 */
		function selectEnd() {
			ionicDatePicker.openDatePicker({
				inputDate: vm.rota.dateEnd ? new Date(vm.rota.dateEnd) : new Date(),
				callback: function (val) {
					vm.rota.dateEnd = moment(val).valueOf();
				}
			});
		}

		/**
		 * clearEnd
		 *
		 * Clear the end date
		 */
		function clearEnd() {
			vm.rota.dateEnd = null;
		}


	}

})();

