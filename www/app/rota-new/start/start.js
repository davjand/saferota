(function () {
	'use strict';
	
	angular
		.module('saferota.rota-new')
		.controller('NewRotaStartController', NewRotaStartController);
	
	NewRotaStartController.$inject = [
		'NewRotaService',
		'$scope',
		'$state',
		'$ionicHistory',
		'ModalSelect',
		'RotaRole',
		'RotaSpeciality',
		'RotaOrganisation',
		'$ionicPopup'];
	
	/* @ngInject */
	function NewRotaStartController(NewRotaService,
									$scope,
									$state,
									$ionicHistory,
									ModalSelect,
									RotaRole,
									RotaSpeciality,
									RotaOrganisation,
									$ionicPopup) {
		var vm = this;
		
		// Relational Data
		vm.workInTheNHS = workInTheNHS;
		vm.selectNHSData = selectNHSData;
		vm.selectNHSDataCallback = selectNHSDataCallback;
		vm.updateViewWithRelatedModel = updateViewWithRelatedModel;
		
		//Validation and Navigation
		vm.attemptProceed = attemptProceed;
		vm.formatValidationError = formatValidationError;
		vm.showValidationError = showValidationError;
		
		vm.cancel = cancel;
		
		activate();
		
		////////////////////////////////////
		
		// Function Definitions
		
		////////////////////////////////////
		
		
		/**
		 *
		 * activate
		 *
		 */
		function activate() {
			vm.rota = NewRotaService.start($scope);
			vm.$worksInTheNHS = false;
			
			vm.fields = {
				role:         {
					factory:  RotaRole,
					title:    'Select Role',
					nameKey:  'title',
					selected: null
				},
				organisation: {
					factory:  RotaOrganisation,
					title:    'Select Organisation',
					nameKey:  'name',
					selected: null
				},
				speciality:   {
					factory:  RotaSpeciality,
					title:    'Select Speciality',
					nameKey:  'title',
					selected: null
				}
			};
			
		}
		
		/**
		 * when users select that they work in the NHS
		 */
		function workInTheNHS() {
			vm.$worksInTheNHS = true;
		}
		
		/**
		 * Open a select box to select the passed field
		 *
		 * @param key
		 */
		function selectNHSData(key) {
			
			var field = vm.fields[key];
			
			ModalSelect.show({
				items:    field.factory.$find({orderBy: field.nameKey}),
				selected: vm.rota[key],
				title:    field.title,
				nameKey:  field.nameKey,
				callback: function (value) {
					vm.selectNHSDataCallback(key, value);
				}
			}, this);
		}
		
		/**
		 * callback for selected Data
		 *
		 * @param key
		 * @param value
		 */
		function selectNHSDataCallback(key, value) {
			vm.rota[key] = value;
			vm.updateViewWithRelatedModel(key);
		}
		
		/**
		 * Update the current
		 * @param key
		 * @returns {*}
		 */
		function updateViewWithRelatedModel(key) {
			if (vm.rota[key]) {
				return vm.rota.$getRel(key).then(function (result) {
					vm.fields[key].selected = result;
				});
			}
			return $q.when();
		}
		
		/**
		 * Cancel the process
		 */
		function cancel() {
			NewRotaService.clear();
			$ionicHistory.goBack();
		}
		
		/**
		 * format a validation error
		 *
		 * @param fields
		 */
		function formatValidationError(fields) {
			var msg = "";
			
			angular.forEach(fields, function (field, index) {
				//Manually change label to name
				if (field === 'label') {
					field = 'name';
				}
				
				//name to Name
				msg += field.charAt(0).toUpperCase() + field.slice(1);
				
				//Appropriate syntax
				if (index === fields.length - 1) {
					if (fields.length === 1) {
						msg += ' is a required field';
					} else {
						msg += ' are required fields';
					}
				} else if (index === fields.length - 2) {
					msg += ' and '
				} else {
					msg += ', ';
				}
			});
			return msg;
		}
		
		/**
		 * show a validation error
		 *
		 * @param fields
		 */
		function showValidationError(fields) {
			$ionicPopup.alert({
				title:  vm.formatValidationError(fields),
				okText: 'Ok',
				okType: 'button-energized'
			});
		}
		
		function attemptProceed(shouldValidateNHSFields) {
			shouldValidateNHSFields = typeof shouldValidateNHSFields !== 'undefined' ?
				shouldValidateNHSFields : false;
			
			var requiredFields = ['label'];
			
			if (shouldValidateNHSFields) {
				requiredFields = requiredFields.concat(
					['role', 'speciality', 'organisation']
				)
			}
			
			var invalidFields = [];
			angular.forEach(requiredFields, function (field) {
				if (!vm.rota[field] || vm.rota[field] == null) {
					invalidFields.push(field);
				}
			});
			
			if (invalidFields.length < 1) {
				NewRotaService.next();
			} else {
				vm.showValidationError(invalidFields);
			}
		}
	}
	
})();

