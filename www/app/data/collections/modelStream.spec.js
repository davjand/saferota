describe('saferota.data ModelStream', function () {
	
	
	var Model, m1, m2, m3, m4,
		$scope;
	beforeEach(function (done) {
		bard.appModule('saferota.data');
		bard.inject('ModelStream', 'DataStore', '$rootScope', '$q');
		
		Model = DataStore.create('Model')
			.schema({name: '', city: '', phone: ''})
			.key('objectId');
		
		m1 = Model.create({name: 'james', city: 'newcastle'});
		m2 = Model.create({name: 'john', city: 'newcastle'});
		m3 = Model.create({name: 'paul', city: 'london'});
		m4 = Model.create({name: 'james', city: 'london'});
		
		$scope = $rootScope.$new();
		
		DataStore.syncAll().then(function () {
			return DataStore.save([m1, m2, m3, m4], true, $scope)
		}).then(function () {
			done();
		});
		_d();
	});
	
	
	function _d() {
		var p = $q.defer();
		setTimeout(function ($rootScope) {
			p.resolve();
			$rootScope.$apply();
		}, 0, $rootScope);
		return p.promise;
	}
	
	it('exists', function () {
		expect(ModelStream).toBeDefined();
	});
	
	describe('constructor', function () {
		var stream;
		beforeEach(function () {
			spyOn(ModelStream.prototype, 'refresh').and.returnValue($q.when());
			spyOn(ModelStream.prototype, 'handleNewEvent').and.callThrough();
			stream = new ModelStream(Model, {name: 'james'});
		});
		it('sets defaults', function () {
			expect(stream._Model).toBe(Model);
			expect(stream._query).toEqual({name: 'james'});
			expect(stream.items).not.toBe(null);
		});
		
		it('triggers a refresh when created', function () {
			expect(stream.refresh).toHaveBeenCalled();
		});
		
		it('adds listeners for new', function () {
			Model.emit('new');
			expect(stream.handleNewEvent).toHaveBeenCalled();
			_d();
		});
	});
	
	describe('refresh', function () {
		it('calls find', function () {
			spyOn(Model, '$find').and.returnValue($q.when());
			var stream = new ModelStream(Model, {name: 'james'});
			expect(Model.$find).toHaveBeenCalledWith(
				{filter: {name: 'james'}}
			);
		});
		
		it('triggers an update when complete', function (done) {
			var stream = new ModelStream(Model, {name: 'james'}),
				called = false;
			stream.on('update', function () {
				called = true;
			});
			_d().then(function () {
				expect(called).toBe(true);
				done();
			});
		});
		
		it('gets the results and saves them into the collection', function (done) {
			var stream = new ModelStream(Model, {name: 'james'});
			
			_d().then(function () {
				expect(stream.items.length()).toBe(2);
				done();
			})
		});
	});
	
	describe('.handleNewEvent', function () {
		var stream;
		beforeEach(function (done) {
			stream = new ModelStream(Model, {name: 'james'});
			_d().then(function () {
				expect(stream.items.length()).toBe(2);
				done();
			})
		});
		
		it('should add an item to the list if matches the filter', function (done) {
			var matchingModel = Model.create({name: 'james'});
			matchingModel.$save().then(function () {
				expect(stream.items.length()).toBe(3);
				done();
			});
			_d();
		});
		
		it('should not add an item to the list if does not match the filter', function () {
			var nonMatchingModel = Model.create({name: 'paul'});
			nonMatchingModel.$save().then(function () {
				expect(stream.items.length()).toBe(2);
				done();
			});
			_d();
		});
		
		it('should match strictly', function () {
			var strictStream = new ModelStream(Model, {name: 'james', city: 'london'});
			var newModel = Model.create({name: 'james', city: 'londontown'});
			
			newModel.$save().then(function () {
				expect(strictStream.items.length()).toBe(1);
				done();
			});
			_d();
		});
	});
	
	describe('.addModel', function () {
		var stream, model;
		beforeEach(function (done) {
			stream = new ModelStream(Model, {name: 'james'});
			_d().then(function () {
				done();
			});
			
			model = Model.create({name: 'test'});
		});
		
		it('adds a model to the collection', function () {
			spyOn(stream.items, 'add');
			stream.addModel(model);
			expect(stream.items.add).toHaveBeenCalled();
			
		});
		it('registers an event listener for update event', function () {
			spyOn(stream, 'handleUpdateEvent');
			stream.addModel(model);
			model.emit('update', model);
			expect(stream.handleUpdateEvent).toHaveBeenCalled();
		});
		
		it('accepts an array', function () {
			stream.addModel([
				model,
				Model.create({name: 'jjj'})
			]);
			expect(stream.items.length()).toBe(4);
		});
	});
	
	describe('.removeModel', function () {
		var stream;
		beforeEach(function (done) {
			stream = new ModelStream(Model, {name: 'james'});
			_d().then(function () {
				done();
			});
		});
		
		it('removes a model from the collection', function () {
			stream.removeModel(m1);
			expect(stream.items.length()).toBe(1);
		});
		it('unregisters update callback', function () {
			spyOn(m1, 'off');
			stream.removeModel(m1);
			expect(m1.off).toHaveBeenCalledWith(
				'update',
				stream._callbacks.update
			);
		});
		it('should deregister the scope', function () {
			spyOn(m1, '$deregister');
			stream.removeModel(m1);
			expect(m1.$deregister).toHaveBeenCalledWith(
				stream._scope
			);
		});
	});
	
	describe('.destroy', function () {
		var stream;
		beforeEach(function (done) {
			stream = new ModelStream(Model, {name: 'james'});
			_d().then(function () {
				done();
			});
		});
		
		it('removes all models', function () {
			spyOn(stream, 'removeModel');
			stream.destroy();
			expect(stream.removeModel.calls.count()).toBe(2);
			
		});
	});
	
	describe('handleUpdateEvent', function () {
		var stream;
		beforeEach(function (done) {
			stream = new ModelStream(Model, {name: 'james'});
			_d().then(function () {
				done();
			});
		});
		it('removes the item from the collection if no longer matches the filter', function (done) {
			spyOn(stream, 'handleUpdateEvent').and.callThrough();
			
			m1.name = 'paul';
			m1.$save().then(function () {
				expect(stream.handleUpdateEvent).toHaveBeenCalled();
				expect(stream.items.length()).toBe(1);
				done();
			});
			_d();
		});
		it('does not removes the item from the collection if it still matches the filter', function (done) {
			spyOn(stream, 'handleUpdateEvent').and.callThrough();
			
			m1.city = 'paul';
			m1.$save().then(function () {
				expect(stream.handleUpdateEvent).toHaveBeenCalled();
				expect(stream.items.length()).toBe(2);
				done();
			});
			_d();
		});
	});
	
	
});