(function () {
	'use strict';

	angular
		.module('saferota.rota-log')
		.controller('RotaLogEditController', RotaLogEditController);

	RotaLogEditController.$inject = [
		'currentTimespan',
		'$scope',
		'moment',
		'ionicTimePicker',
		'ionicDatePicker',
		'$ionicPopup',
		'$state',
		'$rootScope',
		'UI_EVENTS'
	];

	/* @ngInject */
	function RotaLogEditController(currentTimespan,
								   $scope,
								   moment,
								   ionicTimePicker,
								   ionicDatePicker,
								   $ionicPopup,
								   $state,
								   $rootScope,
								   UI_EVENTS) {
		var vm = this;

		/*
		 * interface
		 */

		vm.save = save;
		vm.editDate = editDate;
		vm.editTime = editTime;

		vm.activate = activate;
		vm.deactivate = deactivate;

		/*
		 * Helper for date formatting (dateFilter does not support 1st etc)
		 */
		vm.moment = moment;


		activate();


		/**
		 * activate
		 *
		 * Get the current timespan
		 *
		 */
		function activate() {
			//deactivate when closed
			$scope.$on('$destroy', vm.deactivate);
			//setup keyboard
			$rootScope.$emit(UI_EVENTS.KEYBOARD_ACCESSORY_SHOW);

			//Register Variables
			vm.timespan = currentTimespan;
			vm.timespan.$register($scope);
		}

		/**
		 * deactivate
		 *
		 * rehides the keyboard accessory
		 *
		 */
		function deactivate() {
			$rootScope.$emit(UI_EVENTS.KEYBOARD_ACCESSORY_HIDE);
		}


		/**
		 * save
		 *
		 * Save the current object and redirect back to logs page
		 *
		 */
		function save() {
			vm.timespan.$save().then(function () {
				$state.go('app.view.logs');
			})
		}

		/**
		 * editDate
		 *
		 * Open the date picker to edit the date
		 *
		 * @param key (enter | exit)
		 */
		function editDate(key) {
			ionicDatePicker.openDatePicker({
				inputDate: new Date(vm.timespan[key]),
				callback: function (val) {

					//Convert into the correct format
					val = moment(val).valueOf();
					val = mergeDateTime(val, vm.timespan[key]);

					//Validate
					if (validateDates(val, key)) {
						vm.timespan[key] = val;
						vm.timespan.calculateDuration();
						$scope.$apply();
					}
				}
			});
		}

		/**
		 * editTime
		 *
		 * Open a time picker to edit the time
		 *
		 * Validates the returned value and then updates the
		 * timespan if ok
		 *
		 * @param key (enter | exit)
		 */
		function editTime(key) {
			var m = moment(vm.timespan[key]);
			var time = (m.hours() * 60 * 60) + (m.minutes() * 60);

			/*
			 * Adjust the time for local timezone (plugin doesn't support timezomes
			 *
			 * https://github.com/rajeshwarpatlolla/ionic-timepicker/issues/73
			 *
			 */
			var adjust = new Date().getTimezoneOffset();

			time += (adjust * 60);

			ionicTimePicker.openTimePicker({
				inputTime: time,
				step: 10,
				format: 24,
				callback: function (val) {

					//Convert to correct format
					val = moment(new Date(val * 1000)).valueOf();
					val = mergeDateTime(vm.timespan[key], val);

					//Validate
					if (validateDates(val, key)) {
						vm.timespan[key] = val;
						vm.timespan.calculateDuration();
						$scope.$apply();
					}
				}
			})
		}

		/**
		 * validateDates
		 *
		 * Ensures enter is before exit
		 *
		 * Otherwise show error and return false
		 *
		 * @param newDate
		 * @param type
		 */
		function validateDates(newDate, type) {
			var enter, exit;

			/*
			 * work out which is the date to validate
			 */
			if (type === 'enter') {
				enter = newDate;
				exit = vm.timespan['exit'];
			} else {
				exit = newDate;
				enter = vm.timespan['enter'];
			}


			/*
			 * See if before
			 */
			if (!moment(enter).isBefore(exit)) {
				$ionicPopup.show({
					title: 'Error',
					subTitle: "You cannot set the in time before the out time",
					buttons: [
						{
							text: 'Ok',
							type: 'button-balanced'
						}
					]
				});
				return false;
			}
			return true;

		}


		/**
		 * mergeDateTime
		 *
		 * creates a date with the passed date and time
		 *
		 * @param date
		 * @param time
		 * @returns {*} Datetime in numeric form
		 */
		function mergeDateTime(date, time) {
			var t = moment(time);
			var d = moment(date)
				.hours(t.hours())
				.minutes(t.minutes())
				.seconds(t.seconds())
				.milliseconds(t.milliseconds());
			return d.valueOf();
		}


	}

})();

