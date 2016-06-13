(function () {
	'use strict';
	
	angular
		.module('saferota.rota-log')
		.factory('OrderedCollection', OrderedCollectionFactory);
	
	OrderedCollectionFactory.$inject = [];
	
	/* @ngInject */
	function OrderedCollectionFactory() {
		
		var OrderedCollection = function (comparator, direction) {
			if (!comparator) {
				throw "OrderedCollection: No comparator passed"
			}
			this.setComparator(comparator, direction);
			this._items = [];
		};
		
		OrderedCollection.prototype.add = add;
		OrderedCollection.prototype.get = get;
		OrderedCollection.prototype.length = length;
		OrderedCollection.prototype.remove = remove;
		OrderedCollection.prototype.items = items;
		OrderedCollection.prototype.find = find;
		OrderedCollection.prototype.sort = sort;
		OrderedCollection.prototype.filter = filter;
		OrderedCollection.prototype.asJSON = asJSON;
		OrderedCollection.prototype.setComparator = setComparator;
		
		//Static
		OrderedCollection.default = function (item) {
			return item;
		};
		
		return OrderedCollection;
		
		////////////////////////////////////
		
		// Functions
		
		////////////////////////////////////
		
		
		/**
		 *
		 * Sort the collection
		 */
		function sort() {
			var self = this;
			this._items.sort(function (a, b) {
				var aCompare = self._comparator(a),
					bCompare = self._comparator(b);
				
				if (angular.isString(aCompare)) {
					return self._direction * aCompare.localeCompare(bCompare);
				} else {
					if (aCompare > bCompare) {
						return self._direction;
					} else if (aCompare == bCompare) {
						return 0;
					}
					return -self._direction;
				}
			});
		}
		
		/**
		 * add an item
		 *
		 * @param items
		 */
		function add(items) {
			
			items = angular.isArray(items) ? items : [items];
			
			angular.forEach(items, function (item) {
				this._items.push(item);
			}, this);
			
			this.sort();
			
		}
		
		
		/**
		 * get an item at the index
		 *
		 * @param index
		 * @returns {*}
		 */
		function get(index) {
			return this._items[index];
		}
		
		/**
		 * get the length
		 *
		 * @returns {Number}
		 */
		function length() {
			return this._items.length;
		}
		
		/**
		 * remove an item from the collection
		 * @param index
		 */
		function remove(index) {
			this._items.splice(index, 1);
		}
		
		/**
		 * Set the comparator
		 * @param comparator
		 * @param direction
		 */
		function setComparator(comparator, direction) {
			direction = typeof direction !== 'undefined' ? direction : 1;
			this._comparator = comparator;
			this._direction = direction;
		}
		
		/**
		 * get the items
		 *
		 * @param start {Number} (Optional)
		 * @param length {Number} (Optional)
		 * @returns {Array}
		 */
		function items(start, length) {
			start = typeof start !== 'undefined' && start >= 0 ? start : 0;
			length = length || this._items.length;
			
			if (start === 0 && length === this._items.length) {
				return this._items;
			}
			if (start >= this._items.length) {
				return [];
			}
			
			return this._items.slice(start, start + length);
		}
		
		/**
		 * find the first item
		 * @param callback
		 * @returns {null|*}
		 */
		function find(callback) {
			var found = null,
				index = 0;
			
			while (found === null && index < this._items.length) {
				if (callback(this._items[index])) {
					found = this._items[index];
				}
				++index;
			}
			return found;
		}
		
		/**
		 * filter by callback
		 * @param callback
		 * @returns {Array}
		 */
		function filter(callback) {
			var found = [];
			angular.forEach(this._items, function (item) {
				if (callback(item)) {
					found.push(item);
				}
			});
			return found;
		}
		
		/**
		 * default implementation
		 * @param start
		 * @param limit
		 * @returns {*}
		 */
		function asJSON(start, limit) {
			return this.items(start, limit);
		}
		
	}
	
})();

