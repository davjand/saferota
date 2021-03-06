describe('saferota.data Repository', function () {
	beforeEach(module('saferota.data'));

	var repo, ModelService, TestModel, $rootScope, RequestService, RepositoryService, Transaction;
	var m1, m2, m3, m4, m5;

	var _d = function () {
		$rootScope.$digest();
	};

	beforeEach(inject(function (_ModelService_, _$rootScope_, _RequestService_, _RepositoryService_, _Transaction_) {
		ModelService = _ModelService_;
		$rootScope = _$rootScope_;
		RequestService = _RequestService_;
		RepositoryService = _RepositoryService_;
		Transaction = _Transaction_;

		TestModel = ModelService.create('TestModel').schema({name: 'default', town: ''});
		repo = RepositoryService.create(TestModel);

		m1 = TestModel.create({
			id:          1,
			name:        'James',
			town:        'sheffield',
			updatedDate: new Date(2015, 1, 1)
		});
		m2 = TestModel.create({
			id:          2,
			name:        'John',
			town:        'newcastle',
			updatedDate: new Date(2015, 1, 1)
		});
		m3 = TestModel.create({
			id:          3,
			name:        'Jack',
			town:        'newcastle',
			updatedDate: new Date(2016, 1, 1)
		});
		m4 = TestModel.create({
			id:          4,
			name:        'Jane',
			town:        'sheffield',
			updatedDate: new Date(2016, 1, 1)
		});
		m5 = TestModel.create({
			name: 'New Name',
			town: 'sheffield'
		});


	}));

	afterEach(function () {
		ModelService.clear();
	});

	it('Can Create a repository', function () {
		expect(repo).toBeDefined();
		expect(repo.$local.$cache).toEqual({});

	});

	/*
	 .initConfig
	 */
	it('initConfig loads the cached configuration, if fresh sets _isFresh to true', function (done) {
		repo._initConfig().then(function () {
			expect(repo._configLoaded).toBe(true);
			expect(repo._updatedAt).toBe(null);
			done();
		});
		_d();

	});
	it('initConfig can load a cached date', function (done) {
		var date = new Date(2016, 2, 2);
		repo.$local.updatedAt(date).then(function () {
			return repo._initConfig(true);
		}).then(function () {
			expect(repo._updatedAt).toBe(date);
			done();
		});
		_d();

	});

	/*
	 .ready
	 */
	it('Ready is a promise that resolves when ready', function (done) {

		repo.ready().then(function () {
			expect(repo._configLoaded).toBe(true);
			done();
		});

		repo._initConfig();
		_d();

	});

	/*


	 Internal memory functions


	 */
	it('initializes a $mem cache when created', function () {
		expect(repo.$mem).toEqual({});
	});
	/*
	 _putMem
	 */
	it('_putMem can add a model to memory', function () {

		repo._putMem(m1); //already done by default
		var a = repo.$mem[m1.id];
		expect(a.m).toBe(m1);
		expect(a.c).toBe(1);
		expect(a.s[0]).toBe($rootScope);

		//if try to do again, should do nothing as same scope
		repo._putMem(m1);
		var b = repo.$mem[m1.id];
		expect(b.c).toEqual(1);
		expect(b.s.length).toEqual(1);

		//if try to do with a different scope, should increment
		var $s = $rootScope.$new(true);

		repo._putMem(m1, $s);
		var c = repo.$mem[m1.id];
		expect(c.c).toBe(2);
		expect(c.s[1]).toBe($s);

		//can add a seperate item
		repo._putMem(m2);
		expect(Object.keys(repo.$mem).length).toBe(2);
	});

	/*
	 * .registerModel
	 */
	it('.registerModel throws an error if the passed scope is invalid (not if false or undefined)', function () {
		var $s = $rootScope.$new();


		repo.registerModel(m1); //should execute fine
		repo.registerModel(m2, false); //should execute fine

		var flag = false;
		try {
			repo.registerModel(m3, m4);
		} catch (error) {
			expect(error).toContain("Invalid $scope");
			expect(error).not.toBeUndefined();
			flag = true;
		}
		expect(flag).toBe(true);
	});

	/*
	 * .deregisterModel
	 */
	it('.deregisterModel can remove a model from the internal memory', function () {
		var $s = $rootScope.$new();

		repo.registerModel(m1, $s);

		var c = repo.$mem[m1.id];
		expect(c.c).toBe(1);

		repo.deregisterModel(m1, $s);
		expect(repo.$mem[m1.id]).not.toBeDefined();

	});


	/* Offline Enabled */
	it('.offlineEnabled returns the offline setting from the model', function () {
		var NoSyncModel = ModelService.create('noSync').config({offline: false});
		var noSyncRepo = RepositoryService.create(NoSyncModel);

		//should be false
		expect(noSyncRepo.offlineEnabled()).toBe(false);

		//for the repo created above, should be true
		expect(repo.offlineEnabled()).toBe(true);
	});


	/*
	 _inMem
	 */
	it('_inMem returns true or false if the model / id is in memory', function () {
		repo._putMem(m1);
		expect(repo._inMem(m1)).toBe(true);
		expect(repo._inMem(m1.id)).toBe(true); //can accept string
	});
	/*
	 _regScope callback
	 */
	it('_regScope should create a callback for when being destroyed', function () {

		var $scope = $rootScope.$new(true);
		repo._putMem(m1, $scope);

		spyOn(repo, '_deregScope');
		$scope.$destroy();
		expect(repo._deregScope).toHaveBeenCalled();
	});
	it('_regScope only registered with rootscope if no scope currently on the object', function () {
		var $s = $rootScope.$new();
		repo._putMem(m1, $s);

		var a = repo.$mem[m1.id];
		expect(a.s[0]).toBe($s);
		expect(a.s.length).toBe(1);

		repo._putMem(m1);
		var b = repo.$mem[m1.id];
		expect(b.s.length).toBe(1);


	});

	/*
	 _deregScope
	 */
	it('_deregScope should remove the scope watcher and remove the item from memory if no more scopes attached', function () {

		var $scope = $rootScope.$new(true);
		repo._putMem(m1, $scope);
		$scope.$destroy();

		//should be destroyed
		expect(Object.keys(repo.$mem).length).toEqual(0);

		//if two scopes then should still be there but decremented count
		var $scope2 = $rootScope.$new(true);

		repo._putMem(m1);
		repo._putMem(m1, $scope2);

		$scope2.$destroy();

		var a = repo.$mem[m1.id];
		expect(a.c).toBe(1);
		expect(a.s.length).toBe(1);
		expect(a.s[0]).toBe($rootScope);

	});


	/*
	 save
	 */
	describe('.save', function () {
		
		
		it('throws an error if incorrect models passed to it', function () {
			var flag = false;
			try {
				var M2 = ModelService.create('Model2').schema({name: ''});
				var m = M2.create({name: 'james'});
				
				repo.save(m);
				
				expect(false).toBe(true);
			}
			catch (error) {
				console.log(error);
				expect(error).not.toBeUndefined();
				flag = true;
			}
			expect(flag).toBe(true);

		});
		it('can save a model into the repository, if not registered, will register them', function (done) {
			var $s = $rootScope.$new(true);
			
			//save
			repo.save(m1, $s).then(function () {
				expect(repo._inMem(m1.id)).toBe(true); //should be in memory
				
				return repo.$local.data(m1.id); //should be stored
			}).then(function (object) {
				//should be stored
				expect(object.name).toBe(m1.name);
				done();
			});
			
			_d();
		});
		it('can take an array', function (done) {
			repo.save([m1, m2, m3], $rootScope).then(function () {
				expect(Object.keys(repo.$mem).length).toBe(3);
				
				return repo.$local.length();
			}).then(function (len) {
				expect(len).toBe(3);
				
				done();
			});
			_d();

		});
		
		describe('update events', function () {
			var modelCalled, factoryCalled;
			
			beforeEach(function () {
				modelCalled = 0;
				factoryCalled = 0;
				
				m1.on('update', function () {
					modelCalled++;
				});
				TestModel.on('update', function () {
					factoryCalled++;
				});
			});
			afterEach(function () {
				m1.off('update');
				TestModel.off('update');
			});
			
			it('.save will not trigger an update event for new models', function (done) {
				repo.save(m1, $rootScope).then(function () {
					expect(modelCalled).toBe(0);
					expect(modelCalled).toBe(0);
					done();
				});
				_d();
			});
			it('.save will not trigger an update event for clean existing models', function (done) {
				repo.save(m1, $rootScope).then(function () {
					return repo.save(m1, $rootScope);
				}).then(function () {
					expect(modelCalled).toBe(0);
					expect(modelCalled).toBe(0);
					done();
				});
				_d();
			});
			it('.save will  trigger an update event for dirty existing models', function (done) {
				repo.save(m1, $rootScope).then(function () {
					m1.name = "Paula Jones";
					return repo.save(m1, $rootScope);
				}).then(function () {
					expect(modelCalled).toBe(1);
					expect(modelCalled).toBe(1);
					done();
				});
				_d();
			});


		});
		
		it('will not save into the localStorage if a model config.offline is set to false', function (done) {
			var NoSyncModel = ModelService.create('noSync').schema({
				name: ''
			}).config({offline: false});
			
			var noSyncRepo = RepositoryService.create(NoSyncModel);
			
			var ns1 = NoSyncModel.create({name: 'test'}),
				ns2 = NoSyncModel.create({name: 'test2'});
			
			spyOn(noSyncRepo.$local, 'data');
			
			noSyncRepo.save([ns1, ns2]).then(function () {
				expect(noSyncRepo.$local.data).not.toHaveBeenCalled();
				done();
			});
			_d();
		});
		
		it('will update the model in memory if not the same', function (done) {
			
			var called = 0,
				m12;
			
			m1.on('update', function () {
				called++;
			});
			
			repo.save(m1, $rootScope).then(function () {
				m12 = TestModel.create(m1.toObject(), false, true);
				m12.name = 'new name';
				return repo.save(m12, $rootScope);
			}).then(function () {
				expect(called).toBe(1);
				expect(m1.name).toBe(m12.name);
				done();
			});
			_d();
			
		});
	});

	/*
	 get
	 */
	it('.get can retrieve a model from memory if is in memory', function (done) {

		repo.save([m1, m2, m3], $rootScope).then(function () {
			//spu on here as save may use get
			spyOn(repo.$local, 'get').and.callThrough();

			return repo.get(m1.id)
		}).then(function (model1) {
			//shouldn't have gone to the local adapter
			expect(repo.$local.get).not.toHaveBeenCalled();
			//shouldn't have been recreated, should be existing object
			expect(model1).toBe(m1);
			done();
		});

		_d();
	});
	it('.get can retrieve a model from the cache if forced (and update local object)', function (done) {
		spyOn(repo.$local, 'get').and.callThrough();

		repo.save([m1, m2], $rootScope).then(function () {

			//do some hacking to make sure updates
			repo.$local.$cache[m2.id].name = "New Name";

			return repo.get(m2.id, $rootScope, true);
		}).then(function (model2) {
			//should have gone to the local adapter
			expect(repo.$local.get).toHaveBeenCalled();

			//should have updated the object
			expect(model2).toBe(m2);
			expect(model2.name).toEqual("New Name");
			done();
		});


		_d();
	});
	it('.get can retrieve a model from the cache if it does not exist in memory', function (done) {
		var $s = $rootScope.$new(true);

		repo.save(m1, $s).then(function () {
			$s.$destroy(); //should destroy the in memory copy
			expect(repo._inMem(m1)).toBe(false);

			return repo.get(m1.id, $rootScope);
		}).then(function (newModel) {
			expect(repo._inMem(m1)).toBe(true);
			expect(newModel.name).toBe(m1.name);
			done();
		});

		_d();
	});
	it('.get bypasses local memory if the object is set to offline=false', function (done) {
		var NoSyncModel = ModelService.create('noSync').schema({
			name: ''
		}).config({offline: false});
		var noSyncRepo = RepositoryService.create(NoSyncModel);

		spyOn(noSyncRepo.$local, 'data');

		noSyncRepo.get('test').then(function (item) {
			expect(item).toBe(null);
			expect(noSyncRepo.$local.data).not.toHaveBeenCalled();
			done();
		});
		_d();
	});

	/*
	 .remove
	 */
	it('.remove removes the model from the memory cache', function (done) {
		repo.save(m1).then(function () {
			return repo.remove(m1);
		}).then(function () {
			expect(repo.$mem[m1.id]).toBeUndefined();
			done();
		});
		_d();
	});
	it('.remove triggers a remove event on the model', function (done) {
		var $s = $rootScope.$new(true),
			called = false;

		m1.on($s, 'delete', function () {
			called = true;
		});

		repo.save(m1).then(function () {
			return repo.remove(m1);
		}).then(function () {
			expect(called).toBe(true);
			done();
		});
		_d();
	});
	it('.remove removes from the local repository', function (done) {
		repo.save(m1).then(function () {
			return repo.remove(m1);
		}).then(function () {
			return repo.$local.length();
		}).then(function (len) {
			expect(len).toBe(0);
			done();
		});
		_d();
	});
	it('.remove can bypass local storage if model is offline disabled', function () {
		var NoSyncModel = ModelService.create('noSync').config({offline: false}).schema({name: 'test'});
		var noSyncRepo = RepositoryService.create(NoSyncModel);
		var m = NoSyncModel.create();

		spyOn(noSyncRepo.$local, 'remove');

		noSyncRepo.remove(m);

		expect(noSyncRepo.$local.remove).not.toHaveBeenCalled();

	});

	/*
	 find
	 */
	it('.find filters the local repo and returns items', function (done) {
		repo.save([m1, m2, m3, m4]).then(function () {
			return repo.find({filter: {town: 'newcastle'}});
		}).then(function (models) {
			expect(models.length).toBe(2);
			done();
		});
		_d();
	});
	it('.find items are bound to the passed scope', function (done) {
		var $s1 = $rootScope.$new();
		var $s2 = $rootScope.$new();

		repo.save([m1, m2, m3, m4], $s1).then(function () {
			$s1.$destroy();
			return repo.find({filter: {town: 'newcastle'}}, $s2);
		}).then(function () {

			expect(repo._inMem(m1)).toBe(false);
			expect(repo._inMem(m2)).toBe(true);
			expect(repo._inMem(m3)).toBe(true);
			expect(repo._inMem(m4)).toBe(false);

			$s2.$destroy();
			expect(repo._inMem(m2)).toBe(false);
			expect(repo._inMem(m3)).toBe(false);
			done();
		});
		_d();
	});
	it('.find returns [] if in offline Mode', function () {
		var NoSyncModel = ModelService.create('noSync').config({offline: false});
		var noSyncRepo = RepositoryService.create(NoSyncModel);

		spyOn(noSyncRepo.$local, 'filter');

		noSyncRepo.find();

		expect(noSyncRepo.$local.filter).not.toHaveBeenCalled();
	});

	/*
	 notify
	 */
	it('.notify updates the memory items with the resolved transaction and emits an event', function (done) {
		var $s = $rootScope.$new(),
			flag = false,
			date = new Date(2015, 1, 1),
			tx = new Transaction({
				type:  Transaction.TYPES.CREATE,
				model: m5,
				time:  0
			});

		//callback
		m5.on($s, 'update', function () {
			flag = true;
		});

		tx.resolve({id: '999-999', updatedDate: date});

		repo.save([m3, m4, m5], $rootScope).then(function () {
			return repo.notify(tx);
		}).then(function () {
			expect(m5.id).toBe('999-999');
			expect(repo.$mem[m5.id].m).toBe(m5);
			expect(repo.$mem[m5.id].m.id).toBe(m5.id);
			expect(repo.$mem[m5.id].m.updatedDate).toEqual(date);

			expect(flag).toBe(true);
			$s.$destroy();
			done();
		});

		_d();
	});
	it('.notify updates the local storage items', function (done) {
		var date = new Date(2015, 1, 1);
		var tx = new Transaction({
			type:  Transaction.TYPES.CREATE,
			model: m5,
			time:  0
		});
		tx.resolve({id: '999-999', name: 'updated', updatedDate: date});

		repo.save([m3, m4, m5]).then(function () {
			return repo.notify(tx);
		}).then(function () {
			return repo.$local.data('999-999');
		}).then(function (data) {
			expect(data.updatedDate).toEqual(date);
			expect(data.name).toBe('updated');
			expect(data.id).toBe('999-999');
			done();
		});

		_d();
	});


	/*
	 .notifyUpdate
	 */
	xit('.notifyUpdate can update a model in the data store from passed data', function (done) {
		var $s = $rootScope.$new(),
			flag = false;

		m1.$on('update', function () {
			flag = true;
		});

		repo.save([m1, m2, m3], $s).then(function () {
			m1.name = 'John';
			return repo.notifyUpdate(m1);
		}).then(function () {
			expect(repo.$local[1].name).toEqual('John');
			expect(flag).toBe(true);
			done();
		});

		_d();
	});


	/*
	 clear
	 */
	it('.clear', function () {
		var $s = $rootScope.$new(true);
		repo.save(m1, $s);
		repo.clear();
		expect(repo._inMem(m1.id)).toBe(false);

	});

	/*
	 .sync
	 */
	it('.sync adds the models and saves the sync status', function (done) {
		var date = new Date(2015, 5, 5);
		repo.sync([m1, m2], false, date).then(function () {
			expect(repo._updatedAt).toBe(date);
			return repo.$local.updatedAt();
		}).then(function (d) {
			expect(d).toEqual(date);
			done();
		});
		_d();
	});

	/*
	 *
	 * Events
	 *
	 */
	it('when a new model is saved, a new event is triggered', function (done) {
		var flag = 0;

		TestModel.on('new', function () {
			flag++;
		});

		repo.save(m1).then(function () {
			expect(flag).toBe(1);
			return repo.save(m1);
		}).then(function () {
			expect(flag).toBe(1);//should only be called once
			done();
		});
		_d();
	});


});
