(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('RequestService', RequestService);

	RequestService.$inject = ['TransactionQueue', '$injector', 'Transaction', 'DataConfig', '$q'];

	/* @ngInject */
	function RequestService(TransactionQueue, $injector, Transaction, DataConfig, $q) {

		var self = this;

		//Module Definition
		self.createRequest = createRequest;
		self.create = create;
		self.update = update;
		self.remove = remove;
		self.find = find;
		self.get = get;
		self.next = next;

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
			self.$adapter = new ($injector.get(DataConfig.remote))();
			self.inProgress = false;
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
				if (execute) {
					return self.next();
				}
				return $q.when();
			});
		}


		/**
		 * get
		 *
		 * get request for data
		 *
		 * @param Model
		 * @param id
		 * @returns {*}
		 */
		function get(Model, id) {
			return self.$adapter.get(Model, id);
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
			return self.$adapter.find(Model, options);
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
			self.inProgress = true;
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
			self.inProgress = false;
			return self.$queue.resolveTransaction(data).then(function () {
				if (processAll) {
					return self.next(processAll);
				}
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

