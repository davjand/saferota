(function () {
	'use strict';
	
	angular
		.module('saferota.tests', ['saferota.core'])
		.service('TestDateHelper', TestDateHelper);
	
	TestDateHelper.$inject = ['moment', 'RotaTimespan'];
	
	/* @ngInject */
	function TestDateHelper(moment, RotaTimespan) {
		var self = this;
		
		this.date = dateFromTimestamp;
		this.dateFromTimestamp = dateFromTimestamp;
		this.expectEqualTimestamp = expectEqualTimestamp;
		this.timespan = timespan;
		
		
		/**
		 * create a date from a timestamp
		 * @param timestamp
		 * @returns {*}
		 */
		function dateFromTimestamp(timestamp) {
			return moment(timestamp).valueOf();
		}
		
		/**
		 * expect to be the same
		 * @param start
		 * @param end
		 */
		function expectEqualTimestamp(start, end) {
			expect(moment(start).toString()).toEqual(moment(end).toString());
		}
		
		/**
		 * factory for RotaTimespan
		 * @param date
		 * @returns {*}
		 */
		function timespan(date) {
			date = self.date(date);
			return RotaTimespan.create({
				enter: date,
				exit:  moment(date).add(4, 'hours').valueOf()
			})
		}
		
	}
	
})();

