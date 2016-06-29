(function () {
	'use strict';
	
	angular
		.module('saferota.data')
		.factory('ModelStream', ModelStream);
	
	ModelStream.$inject = ['OrderedCollection', 'eventEmitter', '$rootScope', '$filter'];
	
	/* @ngInject */
	function ModelStream(OrderedCollection, eventEmitter, $rootScope, $filter) {
		
		var Stream = function (ModelFactory, query, comparator, direction) {
			this._Model = ModelFactory;
			this._query = query;
			this._scope = $rootScope.$new(true);
			this._callbacks = {};
			
			comparator = comparator || function (item) {
					return item.getKey();
				};
			this.items = new OrderedCollection(comparator, direction);
			
			this.createListeners();
			
			this.refresh();
		};
		
		Stream.prototype.refresh = refresh;
		Stream.prototype.destroy = destroy;
		
		Stream.prototype.createListeners = createListeners;
		Stream.prototype.handleNewEvent = handleNewEvent;
		Stream.prototype.handleUpdateEvent = handleUpdateEvent;
		
		Stream.prototype.addModel = addModel;
		Stream.prototype.removeModel = removeModel;
		Stream.prototype.in = inStream;
		Stream.prototype.matchesQuery = matchesQuery;
		
		eventEmitter.inject(Stream);
		
		return Stream;
		
		////////////////
		
		/**
		 *
		 * addListeners to the Factory
		 *
		 */
		function createListeners() {
			var self = this;
			
			/*
			 * Create the listeners like this to allow them to be removed
			 */
			this._callbacks.new = function (items) {
				self.handleNewEvent(items);
			};
			this._callbacks.remove = function (model) {
				self.removeModel(model);
			};
			this._callbacks.update = function (model) {
				self.handleUpdateEvent(model);
			};
			
			//Register the listeners
			this._Model.on('new', this._callbacks.new);
			this._Model.on('delete', this._callbacks.remove);
			this._Model.on('update', this._callbacks.update);
		}
		
		/**
		 *
		 * remove the listeners from the factory
		 *
		 */
		function destroy() {

			this._Model.off('new', this._callbacks.new);
			this._Model.off('remove', this._callbacks.remove);
			this._Model.off('update', this._callbacks.remove);
			
			this._scope.$destroy();

			angular.forEach(this.items.items(), function (item) {
				this.removeModel(item);
			}, this);
		}
		
		/**
		 * refresh
		 *
		 * @returns {*}
		 */
		function refresh() {
			var self = this;
			return this._Model.$find({filter: self._query}).then(function (results) {
				if (results) {
					self.addModel(results);
				}
			});
		}
		
		/**
		 * add a model
		 *
		 * @param model
		 * @param force {Boolean} - do not check if in array
		 */
		function addModel(model, force) {
			var self = this;
			force = typeof force !== 'undefined' ? force : false;
			model = angular.isArray(model) ? model : [model];
			
			angular.forEach(model, function (item) {
				if (force || !self.in(item)) {
					item.$register(self._scope);
					self.items.add(item);
				}
			});
			self.emit('update', model);
		}
		
		/**
		 * add model
		 * @param model
		 */
		function removeModel(model) {
			this.items.remove(this.items.indexOf(model));
			model.$deregister(this._scope);
			this.emit('update');
		}
		
		/**
		 * in function
		 * @param model
		 * @returns {boolean}
		 */
		function inStream(model) {
			var result = this.items.find(function (item) {
				return item.getKey() === model.getKey();
			});
			return result !== null;
		}
		
		/**
		 * handleNewEvent
		 *
		 * @param models
		 */
		function handleNewEvent(models) {
			models = angular.isArray(models) ? models : [models];
			var filtered = $filter('filter')(models, this._query, true);
			
			if (filtered.length > 0) {
				this.addModel(filtered);
			}
		}
		
		/**
		 * matchesQuery
		 *
		 * @param model
		 * @returns {boolean}
		 */
		function matchesQuery(model) {
			return $filter('filter')([model], this._query, true).length > 0;
		}
		
		/**
		 * handleUpdateEvent
		 *
		 * if any item in the collection, removes it if no longer matches
		 * If not in the collection, adds if matches ther query
		 *
		 * @param model
		 */
		function handleUpdateEvent(model) {
			var matches = this.matchesQuery(model);
			var existsInCollection = this.in(model);

			if (!existsInCollection && matches) {
				this.addModel(model, true);
			} else if (existsInCollection && !matches) {
				this.removeModel(model);
			}
		}
		
		
	}
	
})();

