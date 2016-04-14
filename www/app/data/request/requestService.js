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
			self.inProgress = false;
			self.isOnline = false;

			self.on('goOnline', function () {
				self.next(true);
			});

			//a little bit of logic to allow promise chaining
			self.on('queueStart', function () {
				self.ready = $q.defer();
				self.inProgess = true;
			});
			self.on('queueComplete', function (error) {
				self.inProgress = false;
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
				if (!self.isOnline) {
					self.isOnline = true;
					self.emit('goOnline');
				}
				p.resolve(true);
			}, function () {
				if (self.isOnline) {
					self.isOnline = false;
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
		 * @returns {Promise}
		 */
		function goOnline(retry, interval) {
			retry = typeof retry !== 'undefined' ? retry : false;
			interval = interval || 1000 * 30; //30 seconds

			var self = this;

			if (self.isOnline) {
				return $q.when();
			}

			return self.pingOnline().then(function (online) {
				if (!online && retry) {
					$timeout(function () {
						self.goOnline(retry, interval)
					}, interval);
				}
				if (online) {
					return $q.when();
				} else {
					return $q.reject();
				}
			})
		}

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
				if (execute && self.isOnline) {
					return self.next();
				} else if (execute) {
					self.goOnline(); //going online should trigger
					return $q.when();
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
			var self = this;

			if (!self.inProgress) {
				self.inProgress = true;
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
			self.inProgress = false;

			var p = $q.defer();
			p.reject(error);
			return p.promise;
		}

	}

})();

