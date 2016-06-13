(function () {
	'use strict';
	
	angular
		.module('saferota.rota-log')
		.factory('WeekCollection', WeekCollectionCreator);
	
	WeekCollectionCreator.$inject = ['Week', 'OrderedCollection'];
	
	/* @ngInject */
	function WeekCollectionCreator(Week, OrderedCollection) {
		
		var WeekCollection = function () {
			this._collection = new OrderedCollection(function (item) {
				return item.start;
			}, -1);
		};
		
		WeekCollection.prototype.add = add;
		WeekCollection.prototype.length = length;
		WeekCollection.prototype.items = items;
		WeekCollection.prototype.asJSON = asJSON;
		WeekCollection.prototype.sort = sort;
		
		WeekCollection.prototype.findMatchingWeek = findMatchingWeek;
		
		
		return WeekCollection;
		
		////////////////////////////////////////
		
		// Function Definitions
		
		////////////////////////////////////////
		
		
		/**
		 * find a week that the timespan fits into. otherwise null
		 *
		 * @param timespan
		 * @returns {*}
		 */
		function findMatchingWeek(timespan) {
			var found = null;
			angular.forEach(this._collection.items(), function (week) {
				if (week.in(timespan.enter)) {
					found = week;
				}
			}, this);
			return found;
		}
		
		
		/**
		 * add a timespan
		 *
		 * @param timespans
		 */
		function add(timespans) {
			timespans = angular.isArray(timespans) ? timespans : [timespans];
			
			angular.forEach(timespans, function (timespan) {
				var week = this.findMatchingWeek(timespan);
				
				if (week === null) {
					week = new Week(timespan.enter);
					this._collection.add(week);
				}
				week.addTimespan(timespan);
				
			}, this);
		}
		
		
		/**
		 * return the items collection
		 *
		 * @param start - defaults 0
		 * @param length - defaults to all
		 * @returns {*|Array}
		 */
		function items(start, length) {
			return this._collection.items(start, length);
		}
		
		/**
		 * get the length
		 * @returns {Number}
		 */
		function length() {
			return this._collection.length();
		}
		
		/**
		 * sort
		 * @returns {*|Array.<T>}
		 */
		function sort() {
			return this._collection.sort();
		}
		
		/**
		 * convert to JSON
		 *
		 * @param start - defaults 0
		 * @param length - defaults to all
		 *
		 * @returns {Array}
		 */
		function asJSON(start, length) {
			var data = [];
			angular.forEach(this._collection.items(start, length), function (week) {
				data.push(week.asJSON());
			});
			return data;
		}
		
		
	}
	
})();

