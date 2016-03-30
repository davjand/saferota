(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('TransactionQueue', CreateTransactionQueue);

	CreateTransactionQueue.$inject = ['Transaction', '$injector', 'DataConfig', '$q'];

	/* @ngInject */
	function CreateTransactionQueue(Transaction, $injector, DataConfig, $q) {

		var TransactionQueue = function (localAdapter, name) {
			name = name || '_queue';
			var self = this;
			self.$cache = new ($injector.get(localAdapter || DataConfig.local))({name: name});

			self.$localId = {};

			self.ready = this._buildLocalIdCache().then(function (data) {
				self.$localId = data;
				return $q.when();
			});
		};

		TransactionQueue.prototype.push = push;
		TransactionQueue.prototype.pushArray = pushArray;
		TransactionQueue.prototype.getNext = getNext;
		TransactionQueue.prototype.pop = pop;
		TransactionQueue.prototype.length = length;
		TransactionQueue.prototype.clear = clear;


		//private
		TransactionQueue.prototype._buildLocalIdCache = _buildLocalIdCache;

		return TransactionQueue;

		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		/**
		 * push
		 *
		 * Push a transaction onto the queue
		 *
		 *
		 * @param transaction
		 * @returns {Function}
		 */
		function push(transaction) {
			var self = this;

			return self.ready.then(function () {
				return self.$cache.keys();
			}).then(function (keys) {
				//get the highest index in the keys
				var nextKey = 0;
				if (angular.isArray(keys)) {
					angular.forEach(keys, function (val) {
						val = parseInt(val, 10);
						if (nextKey <= val) {
							nextKey = val + 1;
						}
					});
				}
				//cache the local id
				_addTransactionToLocalIdCache(transaction, nextKey, self.$localId);

				//put the item into the storage
				return self.$cache.set(nextKey, transaction.toObject());
			});
		}

		/**
		 * pushArray
		 *
		 * Adds multiple items onto the queue
		 *
		 * @param transactions
		 * @returns {*|Promise}
		 */
		function pushArray(transactions) {
			var self = this,
				p = $q.defer(),
				index = 0;

			/*
			 Execute the promises one after another using recursion
			 */
			var fx = function () {
				if (index >= transactions.length) {
					p.resolve();
				} else {
					self.push(transactions[index]).then(function () {
						index++;
						fx();
					});
				}
			};
			fx();
			return p.promise;
		}


		/**
		 * getNext
		 *
		 * @returns {Promise | *}
		 */
		function getNext() {
			var self = this;
			return self.ready.then(function () {
				return self.$cache.keys()
			}).then(function (keys) {
				//ensure got the lowest key
				return self.$cache.get(_lowestVal(keys));
			}).then(function (data) {
				return $q.when(new Transaction(data));
			});
		}

		/**
		 * pop
		 *
		 * Pop the first item off the array
		 *
		 * @returns {Promise | *}
		 */
		function pop() {
			var self = this,
				transaction = null,
				k = null;

			return self.ready.then(function () {
				return self.$cache.keys();
			}).then(function (keys) {
				k = _lowestVal(keys);
				return self.$cache.get(k);
			}).then(function (item) {
				transaction = new Transaction(item);
				/*
				 remove the item from the local cache
				 */
				if (!transaction.model.__existsRemotely) {
					var localPos = 0;
					angular.forEach(self.$localId[transaction.model.id], function (cacheVal, cacheKey) {
						if (parseInt(cacheVal.position, 10) === parseInt(k, 10)) {
							localPos = parseInt(cacheKey, 10);
						}
					});
					self.$localId[transaction.model.id].splice(localPos, 1);
				}
				//remove from the cache
				return self.$cache.remove(k);
			}).then(function () {
				return $q.when(transaction);//resolve the promise with the data
			})
		}

		/**
		 * length
		 *
		 *
		 * @returns {Promise | *}
		 */
		function length() {
			return this.$cache.length();
		}

		/**
		 * clear
		 *
		 * @returns {* | Promise}
		 */
		function clear() {
			this.$localId = {};
			return this.$cache.clear();
		}


		/**
		 * _buildLocalIdCache
		 *
		 * Builds a cache of local items and their positions in the array from
		 * the current cache.
		 *
		 * Format
		 *
		 * - ID: [
		 *   - {
		 *   - position: 1
		 *   - type: P | F (Primary | Foreign)
		 *   - }
		 *]
		 *
		 * @returns {*|Promise}
		 * @private
		 */
		function _buildLocalIdCache() {
			var obj = {},
				self = this;

			return self.$cache.keys().then(function (keys) {
				return self.$cache.data(keys);
			}).then(function (allData) {
				//loop through the data
				angular.forEach(allData, function (tx, key) {
					_addTransactionToLocalIdCache(new Transaction(tx), key, obj);
				});
				return $q.when(obj);
			});
		}


		/**
		 * _addTransactionTo
		 *
		 * Helper function to add a local cache item to the passed cache object
		 *
		 * @param tx
		 * @param position
		 * @param cache
		 * @private
		 */
		function _addTransactionToLocalIdCache(tx, position, cache) {
			if (!tx.model.__existsRemotely) {
				if (typeof cache[tx.model.id] === 'undefined') {
					cache[tx.model.id] = [];
				}
				cache[tx.model.id].push({
					position: parseInt(position, 10),
					type: 'P' //primary. @TODO: implement foreign
				});
			}
		}


		/**
		 * _lowestVal
		 *
		 * Returns the lowest value from an array
		 *
		 * @param vals
		 * @returns {int}
		 */
		function _lowestVal(vals) {
			var k = parseInt(vals[0], 10);
			angular.forEach(vals, function (val) {
				if (k > parseInt(val, 10)) {
					k = parseInt(val);
				}
			});
			return k;
		}
	}

})();

