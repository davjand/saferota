(function () {
	'use strict';
	
	angular
		.module('saferota.rota-log')
		.filter('formatHoursMinutes', formatHoursMinutes);
	
	
	formatHoursMinutes.$inject = [];
	
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
				str = hours + "<span>h</span> ";
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

