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
		}
		
		/**
		 *
		 * remove the listeners from the factory
		 *
		 */
		function destroy() {

			this._Model.off('new', this._callbacks.new);
			this._Model.off('remove', this._callbacks.remove);
			
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
		 */
		function addModel(model) {
			var self = this;
			model = angular.isArray(model) ? model : [model];
			
			angular.forEach(model, function (item) {
				item.$register(self._scope);
				item.on('update', self._callbacks.update);
				self.items.add(item);
			});
			self.emit('update', model);
		}
		
		function removeModel(model) {
			this.items.remove(model);
			model.off('update', this._callbacks.update);
			model.$deregister(this._scope);
			this.emit('update');
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
		 *
		 * @param model
		 */
		function handleUpdateEvent(model) {
			if ($filter('filter')([model], this._query, true).length < 1) {
				this.removeModel(model);
			}
		}
		
		
	}
	
})();

