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

		var _interceptors = {
			error: []
		};
		
		var ERRORS = {
			RETRY_SCHEDULED: 100,
			OFFLINE: 101,
			ONLINE_ATTEMPT_FAIL: 102
		};


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
		self.findChunked = findChunked;
		self.find = find;
		self.get = get;

		self.next = next;
		self.interceptor = interceptor;
		self.startBackgroundQueueProcessing = startBackgroundQueueProcessing;

		self.ready = function () {
			return self.$ready.promise ? self.$ready.promise : self.$ready;
		};

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
		self._processInterceptors = _processInterceptors;

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
			 * A promise to when has finished processing
			 */
			self.$ready = $q.when();

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

			/*
			 * Disable background queue processing, useful
			 * for testing
			 */
			self.$disableBackgroundQueueProcessing = false;

			//a little bit of logic to allow promise chaining
			self.on('queueStart', function () {
				self.$ready = $q.defer();
				self.$inProgress = true;
			});
			self.on('queueComplete', function (error) {
				self.$inProgress = false;
				if (error) {
					self.$ready.reject();
					//reset the promise to a resolved promise for future chaining
					self.$ready = $q.when();
				} else {
					self.$ready.resolve();
				}
			});

			startBackgroundQueueProcessing();
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
			}, function (error) {
				if (self.$isOnline) {
					self.$isOnline = false;
					self.emit('goOffline');
				}

				self._processInterceptors(error);

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
			 * if Scheduled offline
			 */
			if(self.$retryScheduled){
				return rejectPromise ?
					$q.reject({
						code: ERRORS.RETRY_SCHEDULED
					}) :
					$q.when(false);
			}

			/*
			 * If stayOffline then cancel
			 */
			if (self.$stayOffline) {
				return rejectPromise ?
					$q.reject({
						code: ERRORS.OFFLINE
					}) :
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
						self.$onlinePromise.reject({
							code: ERRORS.ONLINE_ATTEMPT_FAIL
						}) :
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
			execute = typeof execute === 'undefined' ? false : execute;

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
		 * findChunked
		 *
		 * Retrieves chunked data from the server
		 * Does a search and if more data is to come via pagination
		 * then keeps calling until no more data
		 *
		 * @param Model
		 * @param options
		 * @returns {Promise} Returns a promise to the complete data set
		 */
		function findChunked(Model, options) {
			var completeData = [];

			/*
			 * Recursive function gets a chunk of data using recursion
			 * If more data is found. THe data is aggregated into the completeData array
			 */
			var fx = function (offset) {
				options.offset = offset || 0;
				/*
				 * Call find
				 */
				return self.$adapter.find(Model, options).then(function (data) {
					/*
					 * Add the found results onto the array
					 */
					completeData = completeData.concat(data.data);

					/*
					 * See if need to do another find or if complete
					 */
					var totalFound = data.offset + data.length;
					if (data.count > totalFound) {
						return fx(totalFound);
					} else {
						return $q.when(completeData);
					}
				})
			};

			/*
			 * Go Online and Start
			 */
			return this.goOnline().then(function () {
				return fx(options.offset);
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
				return self.$ready.promise; //prevent parallel processing
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
		 * startBackgroundQueueProcessing
		 *
		 * starts a timeout cycle every 5 seconds that will process the
		 * transaction queue. Respects online/offline
		 *
		 */
		function startBackgroundQueueProcessing() {
			var PROCESS_EVERY = 5 * 1000; //five seconds

			$timeout(function () {
				if (!self.$disableBackgroundQueueProcessing) {
					self.$queue.length().then(function(length){
						if(length > 0) {
							return self.goOnline(true);
						}else{
							return $q.reject(); //cancel subsequent chain
						}
					}).then(function () {
						self.next(true).then(function () {
							self.startBackgroundQueueProcessing();
						}, function () {
							self.startBackgroundQueueProcessing();
						})
					}, function () {
						self.startBackgroundQueueProcessing();
					});
				}
			}, PROCESS_EVERY);
		}


		/**
		 * interceptor
		 *
		 * Registers an interceptor for requests.
		 * Only supported type at the moment is error
		 *
		 * @param interceptorFunction {Function}
		 * @param type {String} Defaults to 'error'
		 */
		function interceptor(interceptorFunction, type) {
			type = type || 'error';
			_interceptors[type].push(interceptorFunction);
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

			self._processInterceptors();

			var p = $q.defer();
			p.reject(error);
			return p.promise;
		}

		/**
		 * _processInterceptors
		 *
		 * Calls the interceptors for the type with the given data
		 *
		 * @param type
		 * @param data
		 * @private
		 */
		function _processInterceptors(type, data) {
			/*
			 * Call any error interceptors that are relevent
			 */
			angular.forEach(_interceptors[type || 'error'], function (interceptor) {
				interceptor(data);
			});
		}

	}

})();

