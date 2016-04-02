(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('Model', ModelFactory);

	ModelFactory.$inject = [];


	/*

	 Prevent keys that aren't allowed

	 */
	var PROHIBITED = ['_config', '_rel', '_schema'];
	var allowedKey = function (key) {
		return PROHIBITED.indexOf(key) === -1;
	};

	/*

	 Relationship types

	 */
	var RELS = ['hasOne', 'hasMany', 'belongsOne', 'belongsMany'];
	var allowedRel = function (key) {
		return RELS.indexOf(key) !== -1;
	};


	/* @ngInject */
	function ModelFactory() {

		/**
		 *
		 * Constructor for a model class
		 *
		 * @param name
		 * @returns {CreateModel}
		 * @constructor
		 */
		var CreateModel = function (name) {
			this._config = {
				name: name,
				key: 'id'
			};
			this._schema = {};
			this._rel = {};
			this._instance = null;
			this._methods = {};

			return this;
		};

		/*
		 Prototype
		 */
		CreateModel.prototype.config = config;
		CreateModel.prototype.schema = schema;
		CreateModel.prototype.key = key;
		CreateModel.prototype.methods = methods;
		CreateModel.prototype.relationship = relationship;
		CreateModel.prototype.create = create;
		CreateModel.prototype.className = function(){
			return this._config.name;
		};


		return CreateModel;

		////////////////

		/**
		 *
		 * Sets config parameters
		 *
		 * Can be chained
		 *
		 * @param data
		 * @param configType (Optional)
		 * @returns {config}
		 */
		function config(data, configType) {
			data = data || {};
			configType = configType || '_config';

			if (!allowedKey(configType)) {
				angular.merge(this[configType], data);
			}

			return this; //allow chaining
		}

		/**
		 *
		 * Sets the schema
		 *
		 * Can be chained
		 *
		 * @param schema
		 * @returns {*}
		 */
		function schema(schema) {
			schema.createdDate = null;
			schema.updatedDate = null;
			return this.config(schema, '_schema');
		}

		/**
		 *
		 * Set the primary key
		 *
		 * @param primaryKey
		 * @returns {*}
		 */
		function key(primaryKey) {
			return this.config({key: primaryKey});
		}

		/**
		 *
		 * Set class methods
		 *
		 * Accepts a key value array of methods which are then bound to 'this'
		 *
		 * @param methods {Object}
		 * @returns {methods}
		 */
		function methods(methods) {
			var self = this;
			angular.forEach(methods, function (fx, key) {
				if (allowedKey(key)) {
					self._methods[key] = fx;
				}
			});
			return self;
		}

		/**
		 *
		 * Set a belongs to relationship
		 *
		 * @param type - the relationship type (hasOne etc
		 * @param key - the relationship key
		 * @param options {Object | String} - configuration options
		 * @returns {*}
		 */
		function relationship(type, key, options) {
			//allow shorthand
			if (typeof options === 'string') {
				options = {
					model: options
				}
			}
			var rel = {};
			rel[key] = angular.extend(options, {type: type});

			if (allowedRel(type)) {
				this.config(rel, '_rel');
			}
			return this;
		}

		/**
		 *
		 * Creates an instance of the model
		 *
		 * It uses the schema to build a new javascript object and then if data is passed, validates the schema from there
		 *
		 * Can only be called once
		 *
		 * @param createData
		 */
		function create(createData) {

			var factory = this;

			/*
			 If the object has already been created then return a new
			 instance of the created object
			 */
			if (factory._instance !== null) {
				return new factory._instance(createData);
			}

			/*

			 Otherwise we construct a new object from the schema

			 */

			/*

			 Integrity check:

			 1) check that the primary key isn't set in the schema

			 */
			if (typeof this._schema[this._config.key] !== 'undefined') {
				throw('Error: ModelFactory.create - primary key must not be set in model schema');
			}

			/**
			 *
			 * Constructor
			 *
			 * @param passedData
			 */
			var Model = function (passedData) {
				var model = this;

				model.__existsRemotely = false;

				model.setData(passedData, true);

				//Set created and updated dates
				if (model.createdDate === null) {
					model.createdDate = new Date();
				}
				if (model.updatedDate === null) {
					model.updatedDate = new Date();
				}

			};

			//set the schema
			Model.prototype._config = factory._config;
			Model.prototype._rel = factory._rel;
			Model.prototype._schema = factory._schema;

			//set the custom methods
			angular.forEach(factory._methods, function (fx, key) {
				Model.prototype[key] = fx;
			});

			//Default Methods
			Model.prototype.className = function () {
				//noinspection JSPotentiallyInvalidUsageOfThis
				return this._config.name;
			};
			Model.prototype.getPrimaryKey = function () {
				//noinspection JSPotentiallyInvalidUsageOfThis
				return this._config.key;
			};
			Model.prototype.getKey = function () {
				return this[this.getPrimaryKey()];
			};
			Model.prototype.setKey = function (key, remote) {
				remote = typeof remote !== 'undefined' ? remote : true;
				if(typeof key !== 'string'){
					key = key.toString();
				}
				this[this.getPrimaryKey()] = key;
				this.__existsRemotely = remote;
			};

			Model.prototype.setData = setData;
			Model.prototype.getData = getData;
			Model.prototype.data = data;
			Model.prototype.toObject = toObject;
			Model.prototype.guid = guid;
			Model.prototype.resolveWithRemote = resolveWithRemote;


			/**
			 *
			 * Set the data from a passed object
			 *
			 * @param d {data} object
			 * @param setDefault {Boolean} - if set to true will set the defaults
			 *
			 */
			function setData(d, setDefault) {
				d = d || {};
				var self = this;
				setDefault = typeof setDefault === 'undefined' ? false : setDefault;

				var thisModel = this;

				//set each item to either
				angular.forEach(self._schema, function (val, key) {
					if (setDefault) {
						thisModel[key] = d[key] || val;
					} else if (d[key]) {
						thisModel[key] = d[key];
					}
				});

				/*
				 Primary Key / local/remote logic

				 1) is a LOCAL object
				 */
				if (typeof d.__existsRemotely !== 'undefined' && !d.__existsRemotely) {
					if (typeof d[self._config.key] === 'undefined') {
						throw('Error: Model - cannot create local object without key')
					}
					thisModel.setKey(d[self.getPrimaryKey()], false);
				}
				/*
				 2) is a REMOTE Object
				 */
				else if (typeof d[self._config.key] !== 'undefined') {
					thisModel.setKey(d[self.getPrimaryKey()], true);
				}
				/*
				3) new object, generate new ID
				 */
				else {
					thisModel.setKey(self.guid(), false);
				}

			}

			/**
			 *
			 * Get the data from the object
			 *
			 * Traverses 'this' and exports any items that are not functions or undefined
			 *
			 * @returns {{}}
			 */
			function getData() {
				var dataExport = {};
				angular.forEach(this, function (val, key) {
					if (typeof val !== 'function' && typeof val !== 'undefined') {
						dataExport[key] = val;
					}
				});
				return dataExport;
			}

			/**
			 *
			 * Shorthand function
			 *
			 * @param d
			 * @returns {*}
			 */
			function data(d) {
				if (d) {
					return this.setData(d);
				} else {
					return this.getData();
				}
			}

			/**
			 * toObject
			 *
			 * Returns a vanilla json object from the data
			 *
			 * sets className / updatedDate/createdDate if withMeta is true
			 *
			 * @param withMeta {Boolean} - Defaults to true
			 * @returns {{}}
			 */
			function toObject(withMeta) {
				withMeta = typeof withMeta === 'undefined' ? true : withMeta;
				var data = {},
					self = this;

				//Add meta data
				if (withMeta) {
					data.__className = this.className();
					data.__existsRemotely = this.__existsRemotely;
				}
				//parse schema
				angular.forEach(self._schema, function (val, key) {
					if (!withMeta && (key === 'createdDate' || key === 'updatedDate' )) {
						return;
					}
					data[key] = self[key];
				});
				//add id
				data[this.getPrimaryKey()] = this.getKey();
				return data;
			}

			/*
			 Cache the model
			 and return a newly created model
			 */
			factory._instance = Model;
			return new Model(createData);
		}


		/**
		 * guid
		 *
		 * Generate a Unique Identifier to use for local IDs
		 *
		 * Credit to Stack Overflow
		 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
		 *
		 * @returns {string}
		 */
		function guid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();

		}

		/**
		 * resolveWithRemote
		 *
		 * Resolves a local object with remote data
		 *  - Updates the ID
		 *  - Updates any schema items
		 *
		 * @param data
		 */
		function resolveWithRemote(data){
			//remote data must have ID or we're just going to cause a mess
			if(typeof data[this.getPrimaryKey()] === 'undefined'){
				throw('Error: Model - Cannot resolveWithRemote if passed data has no id');
			}
			this.setData(data);
		}

	}
})();

