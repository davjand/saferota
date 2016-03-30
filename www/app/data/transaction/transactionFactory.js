(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('Transaction', Transaction);

	Transaction.$inject = ['ModelService'];

	/* @ngInject */
	function Transaction(ModelService) {

		/*
		 Enum
		 */
		var TX_TYPES = {
			CREATE: 'C',
			UPDATE: 'U',
			DELETE: 'D'
		};

		/**
		 * Constructor
		 *
		 * Construct a transaction, accepts the following parameter combinations
		 *
		 * Initialise from a model and type
		 * ```js
		 new Transaction(Transaction.TYPES[...],ModelInstance)
		 * ```
		 *
		 * Or initialise from a previously objectified Transaction
		 *
		 * ```js
		 new Transaction(TransactionInstance.toObject())
		 * ```
		 *
		 * @param type {string | Object}
		 * @param model {Model}
		 */
		var createTransaction = function (type, model) {

			if(typeof type === 'string') {
				this.type = type;
				this.modelName = model.className();
				this.time = (new Date()).getTime();
				this.model = model;
			}else{
				this.fromObject(type);
			}
		};


		/*
		 Prototype
		 */
		createTransaction.prototype.toObject = toObject;
		createTransaction.prototype.fromObject = fromObject;

		/*
		 Static
		 */
		createTransaction.TYPES = TX_TYPES;


		return createTransaction;


		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		/**
		 * toObject
		 *
		 * Converts the transaction to JSON for storage
		 *
		 * @returns {{type: *, modelName: *, time: *, data: ({type, model, time, data}|*|{years, months, date, hours, minutes, seconds, milliseconds}|{})}}
		 */
		function toObject() {
			return {
				type: this.type,
				modelName: this.modelName,
				time: this.time,
				model: this.model.toObject()
			};
		}

		function fromObject(obj) {
			this.type = obj.type;
			this.time = obj.time;
			this.modelName = obj.modelName;
			this.model = ModelService.get(this.modelName).create(obj.model);
		}
	}

})();

