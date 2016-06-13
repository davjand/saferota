(function () {
	'use strict';
	
	angular
		.module('saferota.rota-log')
		.factory('Week', WeekFactory);
	
	WeekFactory.$inject = ['moment', 'OrderedCollection'];
	
	/* @ngInject */
	function WeekFactory(moment, OrderedCollection) {
		
		/**
		 * constructor
		 *
		 * @param fromDate
		 * @constructor
		 */
		var Week = function (fromDate) {
			this.start = null;
			this.end = null;
			
			this._collection = new OrderedCollection(function (item) {
				return item.enter;
			}, -1);
			
			if (fromDate) {
				this.setFromDate(fromDate);
			}
			
		};
		
		//Methods
		Week.prototype.setFromDate = setFromDate;
		Week.prototype.in = inWeek;
		Week.prototype.collection = collection;
		Week.prototype.length = length;
		Week.prototype.isSame = isSame;
		
		Week.prototype.addTimespan = addTimespan;
		Week.prototype.asJSON = asJSON;
		Week.prototype.calculateDuration = calculateDuration;
		
		//Static Methods
		Week.getStartOfWeek = getStartOfWeek;
		Week.getEndOfWeek = getEndOfWeek;
		
		
		return Week;
		
		//////////
		
		
		/**
		 * Get the start of a week
		 * @param date
		 * @returns {number|Moment}
		 */
		function getStartOfWeek(date) {
			return moment(date).isoWeekday(1).hour(0).minute(0).second(0).millisecond(0);
		}
		
		/**
		 * Get the end day of the week
		 * @param date
		 * @returns {number|Moment}
		 */
		function getEndOfWeek(date) {
			return moment(date).isoWeekday(7).hour(23).minute(59).second(59).millisecond(999);
		}
		
		/**
		 * get a description of a week
		 *
		 * @param date
		 * @returns {{start: (number|Moment|*), end: (number|Moment|*)}}
		 */
		function setFromDate(date) {
			this.start = Week.getStartOfWeek(date).valueOf();
			this.end = Week.getEndOfWeek(date).valueOf();
		}
		
		
		/**
		 *
		 * @param date
		 * @returns {boolean}
		 */
		function inWeek(date) {
			if (this.start === null || this.end === null) {
				return false;
			}
			else if (
				moment(date).isAfter(this.start) &&
				moment(date).isBefore(this.end)
			) {
				return true;
			} else if (
				moment(date).isSame(this.start) ||
				moment(date).isSame(this.end)
			) {
				return true;
			}
			return false;
		}
		
		/**
		 * comparison == function
		 *
		 * @param week
		 * @returns {boolean}
		 */
		function isSame(week) {
			return this.start === week.start;
		}
		
		/**
		 * add a timespan
		 * @param timespans
		 * @returns {boolean}
		 */
		function addTimespan(timespans) {
			timespans = angular.isArray(timespans) ? timespans : [timespans];
			var acceptedTimespans = [];
			
			angular.forEach(timespans, function (timespan) {
				if (this.in(timespan.enter)) {
					acceptedTimespans.push(timespan);
				}
			}, this);
			return this._collection.add(acceptedTimespans);
		}
		
		
		/**
		 * return the collection
		 *
		 * @returns {OrderedCollection}
		 */
		function collection() {
			return this._collection;
		}
		
		/**
		 * get the length of the wrapped collection
		 * @returns {*|Number}
		 */
		function length() {
			return this._collection.length();
		}
		
		/**
		 *
		 * @returns {Object}
		 */
		function asJSON() {
			return {
				start:    this.start,
				end:      this.end,
				items:    this.collection().items(),
				duration: this.calculateDuration()
			}
		}
		
		function calculateDuration() {
			var duration = 0;
			angular.forEach(this.collection().items(), function (item) {
				duration += item.duration;
			});
			return duration;
		}
		
		
	}
	
})();

