(function () {
	'use strict';

	angular
		.module('saferota.rota-log')
		.controller('RotaLogEditController', RotaLogEditController);

	RotaLogEditController.$inject = [
		'currentTimespan',
		'$scope',
		'moment',
		'$ionicPopup',
		'$cordovaDatePicker',
		'$ionicHistory'
	];

	/* @ngInject */
	function RotaLogEditController(currentTimespan,
								   $scope,
								   moment,
								   $ionicPopup,
								   $cordovaDatePicker,
								   $ionicHistory) {
		var vm = this;

		/*
		 * interface
		 */

		vm.save = save;
		//vm.editDate = editDate;
		//vm.editTime = editTime;
		
		vm.handleEnterDateChange = handleEnterDateChange;
		vm.handleExitDateChange = handleExitDateChange;
		
		vm.editEnter = editEnter;
		vm.editEnterDate = editEnterDate;
		vm.editEnterTime = editEnterTime;
		
		vm.editExit = editExit;
		vm.editExitDate = editExitDate;
		vm.editExitTime = editExitTime;

		vm.activate = activate;

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
			//Register Variables
			vm.timespan = currentTimespan;
			vm.timespan.$register($scope);
		}

		/**
		 * save
		 *
		 * Save the current object and redirect back to logs page
		 *
		 */
		function save() {
			vm.timespan.unresolvedError = false; //overwrite the error
			vm.timespan.$save().then(function () {
				$ionicHistory.goBack();
			})
		}


		/**
		 * handleEnterDateChange
		 *
		 * @param date
		 */
		function handleEnterDateChange(date) {
			if (date) {
				if (vm.timespan.afterExit(date)) {
					vm.timespan.translateByNewEnterDate(date);
				} else {
					vm.timespan.enter = date;
				}
				vm.timespan.calculateDuration();
			}
		}
		
		function handleExitDateChange(date) {
			if (date) {
				if (vm.timespan.beforeEnter(date)) {
					vm.timespan.translateByNewExitDate(date);
				} else {
					vm.timespan.exit = date;
				}
				vm.timespan.calculateDuration();
			}
		}
		
		/**
		 * Edit the enter date
		 */
		function editEnterDate() {
			return this.editEnter('date');
		}
		
		/**
		 *
		 * trigger a datepicker to edit the enter time
		 *
		 */
		function editEnterTime() {
			return this.editEnter('time');
		}
		
		/**
		 * Edit the enter date/time
		 * @param mode
		 */
		function editEnter(mode) {
			var vm = this;
			$cordovaDatePicker.show({
				mode: mode || 'date',
				date: vm.timespan.enter
			}).then(function (date) {
				vm.handleEnterDateChange(date);
			});
		}
		
		/**
		 * editExitDate
		 *
		 * @returns {*}
		 */
		function editExitDate() {
			return this.editExit('date');
		}
		
		/**
		 * editExitTime
		 *
		 * @returns {*}
		 */
		function editExitTime() {
			return this.editExit('time')
		}
		
		
		/**
		 * edit the exit time
		 * @param mode
		 */
		function editExit(mode) {
			var vm = this;
			$cordovaDatePicker.show({
				mode:    mode || 'date',
				date:    vm.timespan.exit,
				minDate: vm.timespan.enter,
			}).then(function (date) {
				vm.handleExitDateChange(date);
			});
		}
		
		
		/**
		 * editDate
		 *
		 * !!!!! DEPRECIATED !!!!!
		 *
		 * Open the date picker to edit the date
		 *
		 * @param key (enter | exit)
		 */
		function editDate(key) {
			ionicDatePicker.openDatePicker({
				inputDate: new Date(vm.timespan[key]),
				callback:  function (val) {

					//Convert into the correct format
					val = moment(val).valueOf();
					val = mergeDateTime(val, vm.timespan[key]);

					//Validate
					if (validateDates(val, key)) {
						vm.timespan[key] = val;
						vm.timespan.calculateDuration();
					}
				}
			});
		}

		/**
		 * !!!!! DEPRECIATED !!!!!
		 *
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
				step:      10,
				format:    24,
				callback:  function (val) {

					//Convert to correct format
					val = moment(new Date(val * 1000)).valueOf();
					val = mergeDateTime(vm.timespan[key], val);

					//Validate
					if (validateDates(val, key)) {
						vm.timespan[key] = val;
						vm.timespan.calculateDuration();
					}
				}
			})
		}

		/**
		 *  !!!!! DEPRECIATED !!!!!
		 *
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
			if (moment(enter).isAfter(exit)) {
				$ionicPopup.show({
					title:    'Error',
					subTitle: "You cannot set the in time before the out time",
					buttons:  [
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
		 *  !!!!! DEPRECIATED !!!!!
		 *
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

