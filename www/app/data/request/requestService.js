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
		 * @returns {Promise}
		 */
		function create(model) {
			return this.createRequest(model, Transaction.TYPES.CREATE);
		}

		/**
		 * update
		 *
		 * Shortcut for creating a new update request
		 *
		 * @param model
		 * @returns {Promise}
		 */
		function update(model) {
			return this.createRequest(model, Transaction.TYPES.UPDATE);
		}

		/**
		 * remove
		 *
		 * Shortcut for creating a new delete request
		 *
		 * @param model
		 * @returns {Promise}
		 */
		function remove(model) {
			return this.createRequest(model, Transaction.TYPES.DELETE);
		}


		/**
		 * createRequest
		 *
		 * Queues a transaction request
		 *
		 * @param model
		 * @param type
		 * @returns {$q.promise}
		 */
		function createRequest(model, type) {
			type = type || this.TYPES.CREATE;
			return this.$queue.push(new Transaction(type, model));
		}

		/**
		 * next
		 *
		 * Gets the next item off the queue
		 * Sets it to active
		 * Calls _handleResponse with the response
		 *
		 * @returns {$q.promise}
		 */
		function next() {
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
						return self._handleResponse(data);
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
		 * @private
		 */
		function _handleResponse(data) {
			this.inProgress = false;
			return this.$queue.resolveTransaction(data);
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

