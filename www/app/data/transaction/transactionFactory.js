(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('Transaction', TransactionFactory);

	TransactionFactory.$inject = ['ModelService'];

	/* @ngInject */
	function TransactionFactory(ModelService) {

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
		var Transaction = function (type, model) {

			if(typeof type === 'string') {
				this.type = type;
				this.modelName = model.className();
				this.time = (new Date()).getTime();
				this.model = model;
			}else{
				if (typeof type.modelName === 'undefined') {
					type.modelName = type.model.className();
				}
				this.fromObject(type);
			}
		};


		/*
		 Prototype
		 */
		Transaction.prototype.toObject = toObject;
		Transaction.prototype.fromObject = fromObject;
		Transaction.prototype.resolve = resolve;

		/*
		 Static
		 */
		Transaction.TYPES = TX_TYPES;


		return Transaction;


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
				model: this.model.toObject(),
				resolveData: this.resolveData
			};
		}

		/**
		 * fromObject
		 *
		 * Builds the transaction from an object
		 * expects a model object that can then be converted to a model class
		 *
		 * Main use case for this is deserializing from JSON
		 *
		 * @param obj
		 */
		function fromObject(obj) {
			this.type = obj.type;
			this.time = obj.time;
			this.modelName = obj.modelName;
			this.model = ModelService.get(this.modelName).create(obj.model, false, true);
			this.resolveData = angular.merge({}, obj.resolveData);
		}

		/**
		 *
		 * Sets the resolved data
		 *
		 * @param data
		 */
		function resolve(data) {
			this.resolveData = angular.merge({}, data);
		}
	}

})();

