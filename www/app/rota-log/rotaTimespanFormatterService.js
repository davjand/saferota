(function () {
	'use strict';

	angular
		.module('saferota.rota-log')
		.service('RotaTimespanFormatterService', RotaTimespanFormatterService)
		.filter('formatHoursMinutes', formatHoursMinutes);

	RotaTimespanFormatterService.$inject = ['moment', '$filter'];

	/* @ngInject */
	function RotaTimespanFormatterService(moment, $filter) {
		var self = this;


		self.buildGrouping = buildGrouping;
		self.groupByWeek = groupByWeek;
		self.formatHoursMinutes = formatHoursMinutes;

		////////////////


		/**
		 *
		 * @param start
		 * @param end
		 * @returns {Object} Objects of groupings indexed by start date
		 *
		 * {
		 *   start
		 *   end
		 *   data: []
		 * }
		 *
		 */
		function buildGrouping(start, end) {
			var startDate = moment(start).isoWeekday(1).hour(0).minute(0).millisecond(0);
			var endDate = moment(end).isoWeekday(1);

			if (startDate.isAfter(endDate)) {
				throw "buildGrouping: startDate cannot be after end"
			}
			var groupings = [];

			var nextDate = startDate;
			while (!nextDate.isAfter(endDate)) {
				groupings.push({
					start: nextDate.valueOf(),
					end: moment(nextDate).isoWeekday(7).hour(23).minute(59).second(59).millisecond(999).valueOf(),
					items: []
				});

				nextDate.add(7, 'days');
			}
			return groupings;
		}

		/**
		 * groupByWeek
		 *
		 * Groups the timespans by week
		 *
		 * @param timespans
		 */
		function groupByWeek(timespans) {

			if (timespans.length < 1) {
				return [];
			}

			//Sort so latest last
			timespans = $filter('orderBy')(timespans, '+enter');

			//build the week gropings
			var groupings = self.buildGrouping(
				timespans[0].enter,
				timespans[timespans.length - 1].enter
			);

			//Put the timespans in the correct week groupings
			angular.forEach(timespans, function (item) {
				angular.forEach(groupings, function (group, index) {
					if (item.enter >= group.start && item.enter <= group.end) {
						groupings[index].items.push(item);
					}
				});
			});

			return groupings;
		}
	}


	function formatHoursMinutes() {
		/**
		 * formatHoursMinutes - filter definition
		 *
		 * filter to format durations to hours and minutes for the UI
		 *
		 * Takes the duration in minutes
		 * Returns a response in the format '1h 10m'
		 * The text labels are returned inside span tags for formatting
		 *
		 *
		 *
		 * @param input - the duration in minutes
		 * @returns {String}
		 *
		 */
		return function (input) {
			input = parseFloat(input);

			var hours = Math.floor(input / 60),
				mins = Math.floor(input % 60), //round minutes up to nearest whole
				str = "";

			if (hours > 0) {
				str = hours + "<span>h</span>";
			}

			if (hours > 0 && mins > 0) {
				str = str + "";
			}
			if (mins > 0 || hours < 1) {
				str = str + mins + "<span>m</span>";
			}
			return str;
		}
	}


})();

