(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('RequestService', RequestService);

	RequestService.$inject = [
		'TransactionQueue',
		'$injector',
		'Transaction',
		'DataConfig',
		'$q',
		'eventEmitter',
		'$timeout'];

	/* @ngInject */
	function RequestService(TransactionQueue,
							$injector,
							Transaction,
							DataConfig,
							$q,
							eventEmitter,
							$timeout) {

		var self = this;


		//Online / Offline Functions
		self.pingOnline = pingOnline;
		self.goOnline = goOnline;
		self.scheduleRetryGoOnline = scheduleRetryGoOnline;
		self.stayOffline = stayOffline;
		self.goBackOnline = goBackOnline;


		//Module Definition
		self.createRequest = createRequest;
		self.create = create;
		self.update = update;
		self.remove = remove;
		self.find = find;
		self.get = get;
		self.next = next;

		/*
		 Event Functions
		 .on
		 .emit
		 */
		eventEmitter.inject(self);

		//Static
		self.TYPES = Transaction.TYPES;

		self._handleResponse = _handleResponse;
		self._handleError = _handleError;

		//Initialize
		initialize();


		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		function initialize() {
			self.$queue = new TransactionQueue;
			self.$adapter = new ($injector.get(DataConfig.remote))(DataConfig.remoteConfig);

			/*
			 * If in the progress of a sync (ie multiple things happening
			 */
			self.$inProgress = false;
			/*
			 * If processing a single transaction.
			 * Will get set true/false multiple times if syncing multiple things
			 */
			self.$processing = false;
			/*
			 * Self Explanatory - true if thinks is online
			 */
			self.$isOnline = false;
			/*
			 * True if a retry (via $timeout) is scheduled to attempt to go online
			 */
			self.$retryScheduled = false;
			/*
			 * Number of retrys that have failed when trying to go back online
			 */
			self.$retryCount = 0;
			/*
			 * Limit, number of retrys before gives up
			 */
			self.$RETRY_LIMIT = 5;
			/*
			 * A promise to the retry event
			 */
			self.$retryPromise = null;
			/*
			 * set to true if no intention of going back online unless
			 * reattemptOnline is called
			 * 
			 * can be set by calling stayOffline();
			 * unset via reattemptOnline
			 */
			self.$stayOffline = false;

			/*
			 * True if currently attempting to go online
			 */
			self.$goingOnline = false;
			/*
			 * Promise that resolves true when the current 
			 * going online attempt succeeds
			 */
			self.$onlinePromise = null;

			//a little bit of logic to allow promise chaining
			self.on('queueStart', function () {
				self.ready = $q.defer();
				self.$inProgress = true;
			});
			self.on('queueComplete', function (error) {
				self.$inProgress = false;
				if (error) {
					self.ready.reject();
					//reset the promise to a resolved promise for future chaining
					self.ready = $q.when();
				} else {
					self.ready.resolve();
				}
			});
		}


		/////////////////////////////////////////

		// Online/Offline Function Definitions

		/////////////////////////////////////////

		/**
		 * pingOnline
		 *
		 * If passed true then will reject the promise if offline
		 *
		 * @param rejectPromise {Boolean}
		 *
		 * @returns {Promise}
		 */
		function pingOnline(rejectPromise) {
			rejectPromise = typeof rejectPromise !== 'undefined' ? rejectPromise : false;
			var p = $q.defer(),
				self = this;

			/*

			 */
			self.$adapter.online().then(function () {
				if (!self.$isOnline) {
					self.$isOnline = true;
					self.emit('goOnline');
				}
				p.resolve(true);
			}, function () {
				if (self.$isOnline) {
					self.$isOnline = false;
					self.emit('goOffline');
				}
				rejectPromise ? p.reject() : p.resolve(false);
			});
			return p.promise;
		}

		/**
		 * goOnline
		 *
		 * Attempts to go online
		 *
		 * If does then resolves the promise. Otherwise rejects
		 *
		 * @param retry
		 * @param interval
		 * @param execute {Boolean} if true, will clear the queue as part of the promise
		 * @param rejectPromise {Boolean} Defaults to true. If false will resolve the promise with false rather then reject if fails
		 * @returns {Promise}
		 */
		function goOnline(retry, interval, execute, rejectPromise) {
			retry = typeof retry !== 'undefined' ? retry : false;
			execute = typeof execute !== 'undefined' ? execute : true;
			rejectPromise = typeof rejectPromise !== 'undefined' ? rejectPromise : true;

			var self = this;

			/*
			 * If Online then return
			 */
			if (self.$isOnline) {
				return $q.when();
			}
			/*
			 * If going online, return a single promise
			 */
			else if (self.$goingOnline) {
				return self.$onlinePromise.promise;
			}

			/*
			 * If stayOffline then cancel
			 */
			if (self.$stayOffline) {
				return rejectPromise ?
					$q.reject() :
					$q.when(false);
			}

			/*
			 * Otherwise attempt to go online
			 */
			self.$onlinePromise = $q.defer();
			self.$goingOnline = true;

			self.pingOnline().then(function (online) {
				self.$goingOnline = false;

				if (!online && retry) {
					self.scheduleRetryGoOnline(interval, execute);
				}

				if (online) {
					//reset the retry data
					self.$scheduledRetry = false;
					self.$retryPromise = null;
					self.$retryCount = 0;
					
					execute ?
						self.$onlinePromise.resolve(self.next()) :
						self.$onlinePromise.resolve();

				} else {
					rejectPromise ?
						self.$onlinePromise.reject() :
						self.$onlinePromise.resolve(false);
				}
			});

			return self.$onlinePromise.promise;
		}

		/**
		 * scheduleRetryGoOnline
		 *
		 * Schedules a retry to go online.
		 * If already scheduled returns false
		 * If retry limit is reached, return false and set to permenant offline mode
		 *
		 * @param interval
		 * @param execute
		 */
		function scheduleRetryGoOnline(interval, execute) {
			var self = this;

			//Defaults
			interval = interval || 1000 * 60; //60 seconds
			execute = typeof execute !== 'undefined' ? execute : true;

			//Retry Again
			if (!self.$retryScheduled) {

				self.$retryCount++;

				if (self.$retryCount > self.$RETRY_LIMIT) {
					self.$retryCount = 0;
					self.stayOffline();
					return false;
				}


				self.$retryScheduled = true;
				self.$retryPromise = $timeout(function () {
					self.$retryScheduled = false;
					self.goOnline(true, interval, execute)
				}, interval);
				return true;
			}
			return false;
		}

		/**
		 * stayOffline
		 *
		 * Sets stayoffline to true
		 *
		 * If a retry of going online is scheduled, cancel it
		 *
		 */
		function stayOffline() {
			this.$stayOffline = true;
			if (this.$retryPromise) {
				if ($timeout.cancel(this.$retryPromise)) {
					this.$retryPromise = null;
					this.$retryCount = 0;
					this.$retryScheduled = false;
				}
			}
		}

		/**
		 * goBackOnline
		 *
		 * After a stayOffline call, use this to cancel the
		 * stayOffline status and retry going back online
		 *
		 * @returns {Promise|*}
		 */
		function goBackOnline() {
			this.$stayOffline = false;
			return this.goOnline();
		}

		//////////////////////////////////////////////////////////////

		// Request Functions

		//////////////////////////////////////////////////////////////

		/**
		 * create
		 *
		 * Shortcut for doing a new create request
		 *
		 * @param model
		 * @param execute {Boolean} - to execute now or not
		 * @returns {Promise}
		 */
		function create(model, execute) {
			return this.createRequest(model, Transaction.TYPES.CREATE, execute);
		}

		/**
		 * update
		 *
		 * Shortcut for creating a new update request
		 *
		 * @param model
		 * @param execute {Boolean} - to execute now or not
		 * @returns {Promise}
		 */
		function update(model, execute) {
			return this.createRequest(model, Transaction.TYPES.UPDATE, execute);
		}

		/**
		 * remove
		 *
		 * Shortcut for creating a new delete request
		 *
		 * @param model
		 * @param execute {Boolean} - to execute now or not
		 * @returns {Promise}
		 */
		function remove(model, execute) {
			return this.createRequest(model, Transaction.TYPES.DELETE, execute);
		}


		/**
		 * createRequest
		 *
		 * Queues a transaction request
		 *
		 * @param model
		 * @param type
		 * @param execute {Boolean} Defaults to true
		 * @returns {$q.promise}
		 */
		function createRequest(model, type, execute) {
			var self = this;
			type = type || this.TYPES.CREATE;
			execute = typeof execute === 'undefined' ? true : execute;

			return this.$queue.push(new Transaction(type, model)).then(function () {
				if (execute && self.$isOnline) {
					return self.next(true);
				} else if (execute) {
					return self.goOnline(); //going online should trigger
				}
				return $q.when();
			});
		}


		/**
		 * get
		 *
		 * get request for data
		 *
		 * Rejects if offline
		 *
		 * @param Model
		 * @param id
		 * @returns {*}
		 */
		function get(Model, id) {
			return this.goOnline().then(function () {
				return self.$adapter.get(Model, id);
			});
		}


		/**
		 * find
		 *
		 * find request for data
		 *
		 * @param Model
		 * @param options
		 * @returns {Promise}
		 */
		function find(Model, options) {
			return this.goOnline().then(function () {
				return self.$adapter.find(Model, options);
			});
		}


		/**
		 * next
		 *
		 * Gets the next item off the queue
		 * Sets it to active
		 * Calls _handleResponse with the response
		 *
		 * @param processAll
		 * @returns {$q.promise}
		 */
		function next(processAll) {
			processAll = typeof processAll !== 'undefined' ? processAll : true;

			var self = this;

			if (self.$processing) {
				return self.ready.promise; //prevent parallel processing
			}
			self.$processing = true;

			if (!self.$inProgress) {
				self.$inProgress = true;
				self.emit('queueStart');
			}


			return this.$queue.length().then(function (length) {
				if (length > 0) {
					return self.$queue.getNext().then(function (next) {
						switch (next.type) {
							case self.TYPES.CREATE:
								return self.$adapter.save(next.model);
							case self.TYPES.UPDATE:
								return self.$adapter.update(next.model);
							case self.TYPES.DELETE:
								return self.$adapter.remove(next.model);
							default:
								throw("requestService.next Invalid model type: " + next.type);
						}
					}).then(function (data) {
						return self._handleResponse(data, processAll);
					}, function (error) {
						return self._handleError(error);
					});
				} else {
					self.$processing = false;
					self.emit('queueComplete');
					return $q.when();
				}
			});
		}

		/**
		 * _handleResponse
		 *
		 * @param data
		 * @param processAll
		 * @private
		 */
		function _handleResponse(data, processAll) {
			var self = this;
			return self.$queue.resolveTransaction(data).then(function () {
				self.$processing = false;

				if (processAll) {
					return self.next(processAll);
				}
				self.emit('queueComplete', processAll);
				return $q.when();
			});
		}

		/**
		 * _handleError
		 *
		 * Sets in progress to false and rejects the promise
		 *
		 * @param error
		 * @private
		 */
		function _handleError(error) {
			self.$inProgress = false;
			self.$processing = false;

			var p = $q.defer();
			p.reject(error);
			return p.promise;
		}

	}

})();

