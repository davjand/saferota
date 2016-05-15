(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('TransactionQueue', CreateTransactionQueue);

	CreateTransactionQueue.$inject = ['Transaction', '$injector', 'DataConfig', 'RepositoryService', 'ModelService', '$q'];

	/* @ngInject */
	function CreateTransactionQueue(Transaction, $injector, DataConfig, RepositoryService, ModelService, $q) {

		var TransactionQueue = function (localAdapter, name) {
			name = name || '_queue';
			var self = this;
			self.$cache = new ($injector.get(localAdapter || DataConfig.local))({name: name});
			self.$localId = {};

			self.$lastIndex = -1;


			self.ready = this._buildLocalIdCache().then(function (data) {
				/*
				 * Build the local Id cache
				 */
				self.$localId = data;

				/*
				 * Get the last index
				 */
				return self.$cache.keys();
			}).then(function (keys) {
				self.$lastIndex = _highestVal(keys) || -1;
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
		TransactionQueue.prototype._removeKeyFromLocalIdCache = _removeKeyFromLocalIdCache;

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
				self.$lastIndex++;
				var nextKey = self.$lastIndex;
				//cache the local id
				try {
					_addTransactionToLocalIdCache(transaction, nextKey, self.$localId);
				} catch (error) {
					return $q.reject(error);
				}

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
					self._removeKeyFromLocalIdCache(transaction.model.getKey(), k);
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
		 * @param data
		 * @returns {*}
		 */
		function resolveTransaction(data) {
			data = data || {};
			var self = this,
				transaction,
				p = $q.defer(),
				oldId,
				newId;

			return self.ready.then(function () {
				return self.pop();
			}).then(function (latestTx) {
				oldId = latestTx.model.getKey();
				newId = data[latestTx.model.getPrimaryKey()];

				//see if the ID has changed
				if (!newId) {
					newId = oldId;
				}
				else if (typeof newId !== 'string') {
					newId = newId.toString();
				}

				transaction = latestTx;
				transaction.resolve(data);

				/*
				 * Notify the repository
				 */
				return RepositoryService.notify(transaction);

			}).then(function () {
				/*
				 * see if any other transactions need updating
				 */
				if (!transaction.model.__existsRemotely && self.$localId[transaction.model.getKey()]) {
					var keys = self.$localId[transaction.model.getKey()];

					/*
					 * Keep a track of which models when have notifed in an array
					 * Only for foreign models as we've already notified for the model
					 *
					 * Stored with the syntax className + Id
					 * Store the original model
					 *
					 */
					var notified = [transaction.model.className() + transaction.model.getKey()];


					/*
					 * Process the queue one by one recursively.
					 * This allows promise chaining
					 */
					var fx = function (index) {
						if (index < keys.length) {
							var k = keys[index].position;
							self.$cache.get(k).then(function (item) {
								/*
								 * Update Related Keys Based upon the data
								 */
								if (keys[index].type === 'F') {
									var tx = new Transaction(item),
										resolveData = {};

									resolveData[keys[index].relKey] = newId;

									//notify the repository
									var unique = tx.model.className() + tx.model.getKey();
									if (notified.indexOf(unique) === -1) {
										var updateTransaction = new Transaction(Transaction.TYPES.UPDATE, tx.model);
										updateTransaction.resolve(resolveData);
										RepositoryService.notify(updateTransaction);
										notified.push(unique);
									}

									/*
									 * Set the data that needs to be stored back into the cache
									 *
									 * Ensure that we are replacing the old value with new one, if the
									 * value in the transaction is different then we don't need to adjust it
									 *
									 */
									tx.model.setData(resolveData, false);
									return self.$cache.set(k, tx.toObject());
								}
								/*
								 * Update the primary key
								 */
								else {
									var newTx = new Transaction(item);
									newTx.model.setData(data, false);
									return self.$cache.set(k, newTx.toObject());
								}
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
		 * Will also store related foreign keys
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
					type: 'P' //primary.
				});
			}
			angular.forEach(tx.model._rel, function (rel, key) {
				if (rel.keyType === tx.model.REL_KEY_TYPES.LOCAL &&
					typeof tx.model[key] !== 'undefined' &&
					ModelService.isLocalId(tx.model[key])) {
					/*
					 * if the cache doesn't exist then throw an error
					 * as it means the foreign object hasn't been saved
					 */
					var id = tx.model[key];
					if (typeof cache[id] === 'undefined') {
						throw 'Foreign Object with ID ' + id + ' must be saved before a related object can be saved';
					}
					cache[id].push({
						position: parseInt(position, 10),
						type: 'F',
						relKey: key
					});
				}
			});
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

		/**
		 * _highestVal
		 *
		 * Returns the highest value in an array
		 *
		 * @param vals
		 * @returns {Number}
		 * @private
		 */
		function _highestVal(vals) {
			var k = parseInt(vals[0], 10);
			angular.forEach(vals, function (val) {
				if (k < parseInt(val, 10)) {
					k = parseInt(val);
				}
			});
			return k;
		}

		/**
		 * _removeKeyFromLocalIdCache
		 *
		 * Removes an item from the local cache
		 *
		 * @param id
		 * @param position
		 * @private
		 */
		function _removeKeyFromLocalIdCache(id, position) {
			var localPos = 0,
				self = this;
			angular.forEach(self.$localId[id], function (cacheVal, cacheKey) {
				if (parseInt(cacheVal.position, 10) === parseInt(position, 10)) {
					localPos = parseInt(cacheKey, 10);
				}
			});
			self.$localId[id].splice(localPos, 1);

			//if last one, remove
			if (self.$localId[id].length < 1) {
				delete self.$localId[id];
			}
		}
	}

})();

