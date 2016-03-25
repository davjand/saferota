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
		 * @param force {Boolean} - Allow overwriting of prototype methods
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
		 * @param data
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

			/**
			 *
			 * Constructor
			 *
			 * @param passedData
			 */
			var Model = function (passedData) {
				var model = this;

				model._isNew = true;
				model.setData(passedData);

				//if the primary key is now set,


			};

			//set the schema
			Model.prototype._config = factory._config;
			Model.prototype._rel = factory._rel;
			Model.prototype._schema = factory._schema;

			//set the custom methods
			angular.forEach(factory._methods,function(fx,key){
				Model.prototype[key] = fx;
			});

			//Default Methods
			Model.prototype.className = function(){return this._config.name;};
			Model.prototype.getPrimaryKey = function(){return this._config.key;};
			Model.prototype.getKey = function(){return this[this.getPrimaryKey()];};
			
			Model.prototype.setData = setData;
			Model.prototype.getData = getData;
			Model.prototype.data = data;


			/**
			 *
			 * Set the data from a passed object
			 *
			 * @param d {data} object
			 *
			 */
			function setData(d) {
				d = d || {};
				var thisModel = this;

				angular.forEach(this._schema,function(val,key){
					thisModel[key] = d[key] || val;
				});

				//set the primary key
				if(this._config.key in d){
					thisModel[this._config.key] = d[this._config.key];
					this._isNew = false; //not new if has a primary key
				}
				else{
					thisModel[this._config.key] = null;
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
				angular.forEach(this,function(val,key){
					if(typeof val !== 'function' && typeof val !== 'undefined'){
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

			/*
				Cache the model
				and return a newly created model
			 */
			factory._instance = Model;
			return new Model(createData);
		}
	}
})();

