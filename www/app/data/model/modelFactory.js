(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('Model', ModelFactory);

	ModelFactory.$inject = ['eventEmitter'];


	/*

	 Prevent keys that aren't allowed

	 */
	var PROHIBITED = ['_config', '_rel', '_schema', '_validators'];
	var allowedKey = function (key) {
		return PROHIBITED.indexOf(key) === -1;
	};

	/*

	 Relationship types

	 */
	var RELS = ['hasOne', 'hasMany'];
	var allowedRel = function (key) {
		return RELS.indexOf(key) !== -1;
	};

	var REL_KEY_TYPES = {
		LOCAL: 'local',
		FOREIGN: 'foreign'
	};
	var REL_TYPES = {
		HAS_ONE: 'hasOne',
		HAS_MANY: 'hasMany'
	};


	/* @ngInject */
	function ModelFactory(eventEmitter) {

		var decorators = [];

		/**
		 *
		 * Constructor for a model class
		 *
		 * @param name {string}
		 * @param onCreate {Function}
		 * @returns {CreateModel}
		 * @constructor
		 */
		var CreateModel = function (name, onCreate) {
			this._config = {
				name: name,
				key: 'id'
			};
			this._schema = {};
			this._rel = {};
			this._validators = {};
			this._instance = null;
			this._methods = {};

			//add the callback
			this._onCreate = onCreate;

			return this;
		};

		/*
		 Prototype
		 */
		CreateModel.prototype.REL_KEY_TYPES = REL_KEY_TYPES;
		CreateModel.prototype.config = config;
		CreateModel.prototype.schema = schema;
		CreateModel.prototype.key = key;
		CreateModel.prototype.methods = methods;
		CreateModel.prototype.relationship = relationship;
		CreateModel.prototype.validators = validators;
		CreateModel.prototype.create = create;
		CreateModel.prototype.className = function () {
			return this._config.name;
		};
		CreateModel.prototype.getConfig = function () {
			return angular.merge({}, this._config);//return a copy
		};
		CreateModel.prototype.getKey = function () {
			return this._config.key;
		};

		/*
		 * Register decorators for the model constructor
		 */
		CreateModel.addDecorator = function (decorator) {
			decorators.push(decorator);
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
		 * @param type - {String} the relationship type (hasOne etc
		 * @param key - {String} the relationship key
		 * @param model - {String}
		 * @returns {*}
		 *
		 *
		 * key should contain the key to the related item.
		 * If it lies on the other model it should be
		 * Foreign.owner
		 *
		 * Stores in the following format within _rel
		 * localKey: {
		 *    model: 'Object'
		 *    key: 'key' {can be different from the localKey if is stored on foreign object}
		 *    keyType {FOREIGN | LOCAL}
		 * }
		 *
		 * Possible usages
		 *
		 * .relationship('hasOne','key','Object.key')
		 * .relationship('hasOne','key', 'Object')
		 *
		 */
		function relationship(type, key, model) {

			var options = {
				type: type,
				keyType: REL_KEY_TYPES.LOCAL
			};

			/*
			 * See where the key is
			 */
			if (model.indexOf('.') !== -1) {
				model = model.split('.');
				options.key = model[1];
				options.model = model[0];

				//prevent issues if This.key is passed
				if (options.model === this.className()) {
					options.model = model
				} else {
					options.keyType = REL_KEY_TYPES.FOREIGN;
				}

			} else {
				options.key = key;
				options.model = model;
			}

			if (allowedRel(type)) {
				var rel = {};
				rel[key] = options;
				this.config(rel, '_rel');
			}
			return this;
		}

		/**
		 * validators
		 *
		 *
		 * @parma object
		 *
		 * Accepted formats
		 * Key: Value {Boolean, function}
		 *
		 * If boolean then means required
		 * Otherwise a function that validates the object
		 *
		 * @returns this
		 */
		function validators(object) {
			this.config(object, '_validators');
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
		 * Callback can be passed that will be called every time a model is created
		 *
		 * @param createData
		 * @param $scope
		 * @param stopCallback - stop the onCreate function from being called
		 */
		function create(createData, $scope, stopCallback) {

			var factory = this;


			/*
			 *
			 * If the object has already been created then return a new
			 * instance of the created object
			 *
			 */
			if (factory._instance !== null) {
				return new factory._instance(createData, $scope, stopCallback);
			}

			/*
			 *
			 * Otherwise we construct a new object from the schema
			 *
			 */

			/*
			 *
			 * Integrity check:
			 * 1) If no schema then throw an error
			 *
			 */
			if (Object.keys(factory._schema).length < 1) {
				throw('Error: ModelFactory.create - No Schema Defined');
			}

			/*
			 *
			 *
			 * Integrity check:
			 * 2) Check that the primary key isn't set in the schema
			 *
			 *
			 */
			if (typeof factory._schema[factory._config.key] !== 'undefined') {
				throw('Error: ModelFactory.create - primary key must not be set in model schema');
			}

			/**
			 *
			 * Constructor
			 *
			 * @param passedData {Object}
			 * @param $scope {$scope} The scope to the created object to
			 * @param stopCallback {Function} - Stops the passed callback being called
			 */
			var Model = function (passedData, $scope, stopCallback) {
				var model = this;
				stopCallback = typeof stopCallback === 'undefined' ? false : stopCallback;

				model.__existsRemotely = false;

				model.setData(passedData, true);

				//Set created and updated dates
				if (model.createdDate === null) {
					model.createdDate = new Date();
				}

				/*
				 don't set update date - we can use this to know if it has been saved or not
				if (model.updatedDate === null) {
					model.updatedDate = new Date();
				 }*/

				//callbacks when created
				if (angular.isFunction(Model.prototype._onCreate) && !stopCallback) {
					Model.prototype._onCreate.call(this, $scope);
				}
				if (angular.isFunction(Model.prototype.initialize)) {
					Model.prototype.initialize.call(this);
				}

			};

			//set the schema
			Model.prototype._config = factory._config;
			Model.prototype._rel = factory._rel;
			Model.prototype._schema = factory._schema;
			Model.prototype._validators = factory._validators;

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
				if (typeof key !== 'string') {
					key = key.toString();
				}
				this[this.getPrimaryKey()] = key;
				this.__existsRemotely = remote;
			};
			Model.prototype.getRelationship = function (key) {
				return this._rel[key] || {};
			};
			Model.prototype.REL_KEY_TYPES = REL_KEY_TYPES;
			Model.prototype.REL_TYPES = REL_TYPES;


			Model.prototype.setData = setData;
			Model.prototype.getData = getData;
			Model.prototype.data = data;
			Model.prototype.toObject = toObject;
			Model.prototype.guid = guid;
			Model.prototype.resolveWithRemote = resolveWithRemote;
			Model.prototype.isEqual = isEqual;
			Model.prototype.isValid = isValid;
			Model.prototype.config = function () {
				return this._config;
			};

			//Set a pointer to the factory
			Model.prototype.factory = factory;

			//Callback
			Model.prototype._onCreate = factory._onCreate;

			//Add event emitter
			eventEmitter.inject(Model);

			//Add Decorators
			angular.forEach(decorators, function (fx) {
				fx(Model);
			});


			/*
			 Cache the model
			 and return a newly created model
			 */
			factory._instance = Model;

			//now create the object
			return factory.create(createData, $scope, stopCallback);


			//////////////////////////////////////////////////

			//Function Definitions

			//////////////////////////////////////////////////

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
				//set for relationships
				angular.forEach(self._rel, function (relationship) {
					if (relationship.keyType === 'local') {
						var key = relationship.key;
						if (typeof d[key] !== 'undefined') {
							thisModel[key] = d[key];
						} else if (typeof thisModel[key] === 'undefined') {
							thisModel[key] = null;
						}
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
				 3) new object, generate new ID (if not set)
				 */
				else if (!thisModel.getKey()) {
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
			 * @param withLocalId {Boolean} - Defaults to true. If false omits local ids
			 * @returns {{}}
			 */
			function toObject(withMeta, withLocalId) {
				//default
				withMeta = typeof withMeta !== 'undefined' ? withMeta : true;
				withLocalId = typeof withLocalId !== 'undefined' ? withLocalId : true;

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
				//parse the relationsips
				angular.forEach(self._rel, function (relationship) {
					if (relationship.keyType === 'local') {
						var k = relationship.key;
						data[k] = self[k];
					}
				});

				//add id
				if (this.__existsRemotely || withLocalId) {
					data[this.getPrimaryKey()] = this.getKey();
				}
				return data;
			}
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

			return 'local-' + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
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
		function resolveWithRemote(data) {
			//remote data must have ID or we're just going to cause a mess
			if (typeof data[this.getPrimaryKey()] === 'undefined') {
				throw('Error: Model - Cannot resolveWithRemote if passed data has no id');
			}
			this.setData(data);
		}

		/**
		 * isEqual
		 *
		 * Sees if the current model is the same as the passed model
		 *
		 * @param model
		 * returns {Boolean}
		 */
		function isEqual(model) {
			//see if class name the same
			var self = this;
			if (self.className() !== model.className()) {
				return false;
			}

			//recursive function
			var objEqual = function (obj1, obj2) {
				var match = true;
				angular.forEach(obj1, function (v1, k) {
					var v2 = obj2[k];
					if (angular.isObject(v1) && angular.isObject(v2)) {
						match = match && objEqual(v1, v2);
					} else if (!angular.isObject(v1) && !angular.isObject(v2)) {
						match = match && v1 === v2;
					} else {
						match = false;
					}
				});
				return match;
			};

			var schemaMatch = true;
			angular.forEach(self._schema, function (val, key) {
				//ignore meta data
				if (key === 'updatedDate' || key === 'createdDate') {
					return;
				}

				var v1 = self[key], v2 = model[key];

				if (angular.isObject(v1) && angular.isObject(v2)) {
					schemaMatch = schemaMatch && objEqual(v1, v2);
				} else {
					schemaMatch = schemaMatch && v1 === v2;
				}
			});

			//match relationships
			var relMatch = true;
			angular.forEach(self._rel, function (rel) {
				if (rel.keyType === REL_KEY_TYPES.LOCAL) {
					relMatch = relMatch && self[rel.key] === model[rel.key];
				}
			});

			return schemaMatch && relMatch;
		}

		/**
		 * isValid
		 *
		 * Validates the model data against the validators
		 *
		 * @returns {Boolean}
		 *
		 */
		function isValid() {
			var self = this;

			//If no validators return true
			if (Object.keys(self._validators).length < 1) {
				return true;
			}

			//Loop through the validators
			var valid = true;
			angular.forEach(self._validators, function (item, key) {
				/*
				 * If Boolean, treat as a required flag
				 */
				if (item === true) {
					var v = self[key];
					if (typeof v === 'string' && v.length < 1) {
						valid = false;
					} else if (v === null) {
						valid = false;
					} else if (typeof v === 'undefined') {
						valid = false;
					}
				}
				/*
				 * If function, treat as definitive is valid or not
				 */
				if (angular.isFunction(item)) {
					valid = valid && item(self[key])
				}

			});
			return valid;

		}

	}
})();

