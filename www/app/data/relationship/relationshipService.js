(function () {
	'use strict';

	angular
		.module('saferota.data')
		.service('RelationshipService', RelationshipService);

	RelationshipService.$inject = ['$q'];

	/* @ngInject */
	function RelationshipService($q) {
		var self = this;


		//Module Definition
		self.registerDataStore = registerDataStore;
		self.setRelated = setRelated;
		self.getRelated = getRelated;
		self.removeRelated = removeRelated;
		self.decorate = decorate;


		initialize();


		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		function initialize() {
			self.$store = null;
		}

		/**
		 * Registers the Datastore to use to look for objects
		 *
		 * Prevents circular dependencies
		 *
		 * @param Store
		 */
		function registerDataStore(Store) {
			self.$store = Store;
		}


		/**
		 * setRelated
		 *
		 *
		 * @param model
		 * @param key
		 * @param foreignModel
		 * @param clear {Boolean}    for hasMany relationships only,
		 *                            if push then will add to existing rather than reset
		 *
		 * @returns {Promise}
		 */
		function setRelated(model, key, foreignModel, clear) {
			var r = model.getRelationship(key),
				self = this;

			clear = typeof clear !== 'undefined' ? clear : false;


			if (r.keyType === model.REL_KEY_TYPES.LOCAL &&
				r.type === model.REL_TYPES.HAS_ONE) {
				/*
				 HasOne / Local
				 */
				model[key] = foreignModel.getKey();
				return self.$store.save(model);

			} else if (r.keyType === model.REL_KEY_TYPES.FOREIGN &&
				r.type === model.REL_TYPES.HAS_ONE) {
				/*
				 HasOne / Foreign
				 */

				//need to see if existing and remove
				return self.removeRelated(model, key).then(function () {
					foreignModel[r.key] = model.getKey();
					return self.$store.save(foreignModel);
				});

			} else if (r.keyType === model.REL_KEY_TYPES.LOCAL &&
				r.type === model.REL_TYPES.HAS_MANY) {
				/*
				 * HasMany / Local
				 */
				throw('HasMany with a Local Key is not currently supported');

			} else if (r.keyType === model.REL_KEY_TYPES.FOREIGN &&
				r.type === model.REL_TYPES.HAS_MANY) {
				/*
				 HasMany / Foreign
				 */
				var removePromise = $q.when();
				if (clear) {
					removePromise = self.removeRelated(model, key);
				}
				return removePromise.then(function () {
					if (!angular.isArray(foreignModel)) {
						foreignModel = [foreignModel]
					}
					var pArr = [];
					angular.forEach(foreignModel, function (fm) {
						fm[r.key] = model.getKey();
						pArr.push(self.$store.save(fm));
					});
					return $q.all(pArr);
				});
			}
		}


		/**
		 * removeRelated
		 *
		 * Removes a related item
		 *
		 * @param model
		 * @param key
		 * @param foreignModel {Object} - Model to remove for has Many
		 */
		function removeRelated(model, key, foreignModel) {
			var r = model.getRelationship(key),
				self = this;

			if (r.keyType === model.REL_KEY_TYPES.LOCAL &&
				r.type === model.REL_TYPES.HAS_ONE) {
				/*
				 HasOne / Local
				 */
				model[r.key] = null;
				return self.$store.save(model);

			} else if (r.keyType === model.REL_KEY_TYPES.FOREIGN &&
				r.type === model.REL_TYPES.HAS_ONE) {
				/*
				 HasOne / Foreign
				 */
				return self.getRelated(model, key).then(function (foreignModel) {
					if (!foreignModel) {
						return $q.when();
					}
					foreignModel[r.key] = null;
					return self.$store.save(foreignModel);
				});


			} else if (r.keyType === model.REL_KEY_TYPES.LOCAL &&
				r.type === model.REL_TYPES.HAS_MANY) {
				/*
				 * HasMany / Local
				 */
				throw('HasMany with a Local Key is not currently supported');

			} else if (r.keyType === model.REL_KEY_TYPES.FOREIGN &&
				r.type === model.REL_TYPES.HAS_MANY) {
				/*
				 HasMany / Foreign
				 */
				var p;
				if (!foreignModel) {
					//All
					p = self.getRelated(model, key);
				} else {
					//Single or multiple passed
					foreignModel = angular.isArray(foreignModel) ? foreignModel : [foreignModel];
					p = $q.when(foreignModel);
				}
				return p.then(function (models) {
					if (!models) {
						return $q.when();
					}
					var pArr = [];
					angular.forEach(models, function (m) {
						pArr.push(self.removeRelated(m, r.key));
					});
					return $q.all(pArr);
				});

			}
			else {
				throw('Invalid Relationship key');
			}
		}


		/**
		 * getRelated
		 *
		 * Retrieves a promise to a related object
		 *
		 * @param model
		 * @param key
		 * @param $scope
		 * @returns {Promise}
		 */
		function getRelated(model, key, $scope) {
			var r = model.getRelationship(key),
				self = this,
				filter;

			if (r.keyType === model.REL_KEY_TYPES.LOCAL &&
				r.type === model.REL_TYPES.HAS_ONE) {
				/*
				 HasOne / Local
				 */
				//no point going any further
				if (!model[key]) {
					return $q.when();
				}

				return self.$store.get(r.model, model[key], $scope);

			} else if (r.keyType === model.REL_KEY_TYPES.FOREIGN &&
				r.type === model.REL_TYPES.HAS_ONE) {
				/*
				 HasOne / Foreign
				 */
				//build a filter to match
				filter = {filter: {}};
				filter.filter[r.key] = model.getKey();

				return self.$store.find(r.model, filter, $scope).then(function (models) {
					return $q.when(models.length > 0 ? models[0] : null);
				});

			} else if (r.keyType === model.REL_KEY_TYPES.LOCAL &&
				r.type === model.REL_TYPES.HAS_MANY) {
				/*
				 * HasMany / Local
				 */
				throw('HasMany with a Local Key is not currently supported');

			} else if (r.keyType === model.REL_KEY_TYPES.FOREIGN &&
				r.type === model.REL_TYPES.HAS_MANY) {
				/*
				 HasMany / Foreign
				 */
				filter = {filter: {}};
				filter.filter[r.key] = model.getKey();
				return self.$store.find(r.model, filter, $scope).then(function (models) {
					return $q.when(models.length > 0 ? models : null);
				});
			}
		}


		/**
		 * decorate
		 *
		 * Decorates the model prototypes with accessors for their relationships
		 *
		 * Creates a $get / $set / $remove method on the model constructor
		 * which call getRelated, setRelated and removeRelated
		 * respectively. Binds the calling model to be the first parameter
		 * in these functions.
		 *
		 * @param ModelConstructor
		 */
		function decorate(ModelConstructor) {
			var self = this,
				getArgs = function (that, args) {
					var a = Array.prototype.slice.call(args);
					a.unshift(that);
					return a;
				};

			ModelConstructor.prototype.$get = function () {
				return self.getRelated.apply(self, getArgs(this, arguments));
			};
			ModelConstructor.prototype.$set = function () {
				return self.setRelated.apply(self, getArgs(this, arguments));
			};
			ModelConstructor.prototype.$remove = function () {
				return self.removeRelated.apply(self, getArgs(this, arguments));
			};
		}

	}

})();

