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

		self.decorateAll = decorateAll; //@TODO might be better in ModelService


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
		 * @param push {Boolean}    for hasMany relationships only,
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
				if (!angular.isArray(foreignModel)) {
					foreignModel = [foreignModel]
				}
				var pArr = [];
				angular.forEach(foreignModel, function (fm) {
					fm[r.key] = model.getKey();
					pArr.push(self.$store.save(fm));
				});
				return $q.all(pArr);

			}
		}


		/**
		 * removeRelated
		 *
		 * Removes a related item
		 *
		 * @param model
		 * @param key
		 * @param foreignModel
		 */
		function removeRelated(model, key) {
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

			}
			else {
				throw('Invalid Relationship key');
			}
		}


		function getRelated(model, key, $scope) {
			var r = model.getRelationship(key),
				self = this;

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
				var filter = {filter: {}};
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

			}

		}


		/**
		 * decorate
		 *
		 * Decorates the model prototypes with accessors for their relationships
		 *
		 *
		 * @param Model
		 */
		function decorate(Model) {

		}


		function decorateAll() {

		}
	}

})();

