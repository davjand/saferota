(function () {
	'use strict';
	
	angular
		.module('saferota.rota-log')
		.factory('Pager', PagerFactory);
	
	PagerFactory.$inject = [];
	
	/* @ngInject */
	function PagerFactory() {
		
		/**
		 * Very very simple pager functionality takes a collection
		 * and adds an extra page at a time of data to the data object
		 *
		 *
		 * @param collection {OrderedCollection}
		 * @param options {Object}
		 * @constructor
		 */
		var Pager = function (collection, options) {
			options = options || {};
			this._collection = collection;
			
			//Settings
			this.$start = options.start || 0;
			this.$limit = options.limit || 10;
			
			//Internal Counters
			this.refresh();
			
		};
		
		Pager.prototype.nextPage = nextPage;
		Pager.prototype.moreAvailable = moreAvailable;
		Pager.prototype.refresh = refresh;
		Pager.prototype.reload = reload;
		
		return Pager;
		
		
		////////////////////////////////////
		
		// Functions
		
		////////////////////////////////////
		
		
		/**
		 * see if records are available
		 *
		 * @returns {boolean}
		 */
		function moreAvailable() {
			return this.$count < this._collection.length();
		}
		
		
		/**
		 * nextPage
		 *
		 * Load the next page
		 *
		 */
		function nextPage() {
			this.data = this.data.concat(this._collection.asJSON(this.$count, this.$limit));
			
			//Update the variables
			this.$count = this.data.length;
			this.$more = this.moreAvailable()
		}
		
		/**
		 * refresh
		 *
		 */
		function refresh() {
			this.$more = false;
			this.$count = this.$start;
			this.data = [];
			this.nextPage();
		}
		
		
		/**
		 *
		 * clear the data out and rebuild with the data to the current poitn
		 *
		 */
		function reload() {
			this.$more = false;
			this.data = this._collection.asJSON(this.$start, this.$count);
		}
		
		
	}
	
})();

