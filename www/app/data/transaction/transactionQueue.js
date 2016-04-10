(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('TransactionQueue', CreateTransactionQueue);

	CreateTransactionQueue.$inject = ['Transaction', '$injector', 'DataConfig', 'RepositoryService', '$q'];

	/* @ngInject */
	function CreateTransactionQueue(Transaction, $injector, DataConfig, RepositoryService, $q) {

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
		TransactionQueue.prototype.resolveTransaction = resolveTransaction;


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
				return self.$cache.keys();
			}).then(function (keys) {
				if (keys.length < 1) {
					return $q.when(null); //no keys to get
				} else {
					//ensure got the lowest key
					return self.$cache.get(_lowestVal(keys)).then(function (data) {
						return $q.when(new Transaction(data));
					});
				}
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
					angular.forEach(self.$localId[transaction.model.getKey()], function (cacheVal, cacheKey) {
						if (parseInt(cacheVal.position, 10) === parseInt(k, 10)) {
							localPos = parseInt(cacheKey, 10);
						}
					});
					self.$localId[transaction.model.getKey()].splice(localPos, 1);

					//if last one, remove
					if (self.$localId[transaction.model.getKey()].length < 1) {
						delete self.$localId[transaction.model.getKey()];
					}
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
		 * resolveTransaction
		 *
		 * Pass in data from a remote service (expects an ID)
		 *  - Pops of the last transaction and notifies the repo to update
		 *  - Reviews any cached transactions that are of the same object an update
		 *
		 *  Only supports primary keys at the moment
		 *  @TODO Foreign key support
		 *
		 * @param data
		 * @returns {*}
		 */
		function resolveTransaction(data) {
			data = data || {};
			var self = this,
				transaction;

			return self.ready.then(function () {
				return self.pop();
			}).then(function (latestTx) {
				var p = $q.defer(),
					oldId = latestTx.model.getKey();

				transaction = latestTx;
				transaction.resolve(data);

				//see if any other transactions need updating
				if (!transaction.model.__existsRemotely && self.$localId[transaction.model.getKey()]) {
					var keys = self.$localId[transaction.model.getKey()];
					var fx = function (index) {
						if (index < keys.length) {
							var k = keys[index].position;
							self.$cache.get(k).then(function (item) {
								var tx = new Transaction(item);
								tx.model.setData(data, false);
								return self.$cache.set(k, tx.toObject());
							}).then(function () {
								fx(index + 1);
							});
						} else {
							delete self.$localId[oldId];
							p.resolve();
						}
					};
					fx(0);
				}
				else {
					p.resolve();
				}
				return p.promise;
			}).then(function () {
				RepositoryService.notify(transaction);
			});
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
				if (typeof cache[tx.model.getKey()] === 'undefined') {
					cache[tx.model.getKey()] = [];
				}
				cache[tx.model.getKey()].push({
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

