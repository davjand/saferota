(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('TransactionQueue', CreateTransactionQueue);

	CreateTransactionQueue.$inject = ['Transaction','$injector','DataConfig'];

	/* @ngInject */
	function CreateTransactionQueue(Transaction, $injector,DataConfig) {

		var TransactionQueue = function(localAdapter, name){
			name = name || '_queue';
			this.$cache = new ($injector.get(localAdapter || DataConfig.local))({name: name});
		};

		TransactionQueue.prototype.push = push;
		TransactionQueue.prototype.getNext = getNext;
		TransactionQueue.prototype.pop = pop;
		TransactionQueue.prototype.length = length;
		TransactionQueue.prototype.clear = clear;
		
		return TransactionQueue;

		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		function push() {

		}

		function getNext() {

		}

		function pop() {

		}

		function length() {

		}

		function clear() {
			return this.$cache.clear();
		}
	}

})();

