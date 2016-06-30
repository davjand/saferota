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
			templateUrl: 'app/core/directives/rota-edit/rotaEdit.html',
			scope: {
				rota: '=',
				edit: '@' //whether an edit form or not
			}
		};
	}

	RotaEditController.$inject = [
		'$scope',
		'moment',
		'Rota',
		'RotaLocation',
		'$state',
		'$q',
		'ionicDatePicker',
		'ModalSelect',
		'RotaRole',
		'RotaOrganisation',
		'RotaSpeciality',
		'$ionicScrollDelegate',
		'$ionicListDelegate',
		'$ionicPopup',
		'RotaGeoFenceService'
	];

	/* @ngInject */
	function RotaEditController($scope,
								moment,
								Rota,
								RotaLocation,
								$state,
								$q,
								ionicDatePicker,
								ModalSelect,
								RotaRole,
								RotaOrganisation,
								RotaSpeciality,
								$ionicScrollDelegate,
								$ionicListDelegate,
								$ionicPopup,
								RotaGeoFenceService) {
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
		
		vm.addLocation = addLocation;
		vm.editLocation = editLocation;
		vm.deleteLocation = deleteLocation;

		activate();


		/**
		 * activate
		 *
		 */
		function activate() {
			vm.BANDING = Rota.BANDING_OPTIONS;
			vm.rota = $scope.rota;
			vm.valid = false;

			vm.edit = typeof $scope.edit !== 'undefined' ? $scope.edit : false;

			vm.role = {};
			vm.organisation = {};
			vm.speciality = {};
			vm.locations = [];

			$q.all([
				_getRel('role'),
				_getRel('organisation'),
				_getRel('speciality')
			]).then(function () {
				$ionicScrollDelegate.resize(); //update scrollview after adding in text
			});
			
			vm.rota.$getRel('locations', $scope).then(function (locations) {
				vm.locations = locations;
			});
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
				return vm.rota.$getRel(key).then(function (result) {
					vm[key] = result;
				});
			}
			return $q.when();
		}
		
		
		/**
		 * add a location
		 *
		 */
		function addLocation() {
			var newLocation = RotaLocation.create({rota: vm.rota.getKey()}, $scope);
			newLocation.generateUID();
			vm.locations.push(newLocation);
			vm.editLocation(newLocation);
		}
		
		/**
		 * Edit a location
		 *
		 * @param location
		 */
		function editLocation(location) {
			$state.go('app.edit-location', {
				rotaId:     vm.rota.getKey(),
				locationId: location.getKey()
			});
		}
		
		/**
		 * Remove a location
		 *
		 * @param location
		 * @param $event
		 * @returns {*}
		 */
		function deleteLocation(location, $event) {
			$ionicListDelegate.closeOptionButtons();
			if (vm.locations.length < 2) {
				$ionicPopup.alert({
					title:    'Cannot delete',
					subTitle: 'A rota must have at least 1 location',
					okType:   'button-energized'
				});
				return;
			}
			
			$event.stopPropagation();
			
			return RotaGeoFenceService.deactivateLocation(location).then(function () {
				location.archived = true;
				
				var index = vm.locations.indexOf(location);
				if (index !== -1) {
					vm.locations.splice(index, 1);
				}
				return location.$save();
			});

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
		 * @param $event
		 *
		 */
		function selectStart($event) {
			$event.preventDefault();
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
		 * @param $event
		 */
		function selectEnd($event) {
			$event.preventDefault();
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

