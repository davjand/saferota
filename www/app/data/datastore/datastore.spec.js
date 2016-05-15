describe('saferota.data DataStore', function () {
	beforeEach(module('saferota.data'));

	var DataStore, RepositoryService, ModelService, RequestService, $rootScope, $timeout, $q,
		TestModel1, TestModel2, TestModelPet,
		repo1;

	beforeEach(inject(function (_DataStore_,
								_RepositoryService_,
								_ModelService_,
								_RequestService_,
								_$rootScope_,
								_$timeout_,
								_$q_) {


		DataStore = _DataStore_;
		RepositoryService = _RepositoryService_;
		ModelService = _ModelService_;
		RequestService = _RequestService_;
		$rootScope = _$rootScope_;
		$timeout = _$timeout_;
		$q = _$q_;

		TestModel1 = DataStore.create('test1').schema({
			name: '',
			city: ''
		}).relationship('hasMany', 'pets', 'pet.owner');

		TestModel2 = DataStore.create('test2').schema({name: '', city: ''}).key('objectId');
		TestModelPet = DataStore.create('pet').schema({name: ''}).relationship('hasOne', 'owner', 'test1');


		repo1 = RepositoryService.get(TestModel1);

	}));

	afterEach(function () {
		DataStore.clear(true).then(function () {
			RepositoryService.clear();
			ModelService.clear();
		});
	});

	/*

	 Helper Functions

	 */
	function _d() {
		$rootScope.$digest();
	}

	function createRemoteData() {
		RequestService.$adapter.$cache = {
			test1: [
				{
					id: 1,
					name: 'James',
					city: 'Newcastle',
					updatedDate: new Date(2015, 5, 5)
				},
				{
					id: 2,
					name: 'John',
					city: 'Sheffield',
					updatedDate: new Date(2015, 5, 5)
				},
				{
					id: 3,
					name: 'David',
					city: 'Newcastle',
					updatedDate: new Date(2015, 5, 5)
				}
			],
			test2: [
				{
					objectId: 1,
					name: 'James',
					city: 'Newcastle'
				},
				{
					objectId: 2,
					name: 'John',
					city: 'Sheffield'
				},
				{
					objectId: 3,
					name: 'David',
					city: 'London'
				}
			]
		};
	}


	/*
	 .create
	 */
	it('.create can create a model definition, repository and setup a callback', function () {
		var TestModel10 = DataStore.create('test10').schema({name: 'david'});

		expect(ModelService.get('test10')).not.toBeUndefined();
		expect(RepositoryService.get(TestModel10)).not.toBeUndefined();

	});
	it('.create sets up a callback so whenever a model is created, it is cached in the repo', function () {
		var TestModel10 = DataStore.create('test10').schema({name: 'david'});
		var m1 = TestModel10.create({name: 'james'}, $rootScope);

		expect(RepositoryService.get(TestModel10)._getMem(m1.id).name).toBe('james');
	});

	/*
	 .save
	 */
	it('.save saves locally', function (done) {
		var model = TestModel1.create({
			name: 'john',
			city: 'New York'
		}, $rootScope);
		var repo = RepositoryService.get('test1');

		DataStore.save(model, false).then(function () {
			//the repo returns it
			return repo.get(model.id);
		}).then(function (repoModel) {
			expect(repoModel).toBe(model);
			return repo.$local.data(model.getKey());
		}).then(function (data) {
			//check saved locally
			expect(data.name).toBe('john');
			done();
		});
		_d();
	});

	it('.save queues a save event and when executed a model update event is fired', function (done) {
		var called = false,
			model = TestModel1.create({
				name: 'john',
				city: 'New York'
			}, $rootScope);
		var initialId = model.getKey();

		model.on('update', function () {
			called = true;
		});

		DataStore.save(model, false).then(function () {
			return RequestService.next();
		}).then(function () {
			expect(called).toBe(true);
			expect(model.__existsRemotely).toBe(true);
			expect(model.id).not.toBe(initialId);
			done();
		});
		_d();
	});
	it('.save can return only when the save event has completed if forced', function (done) {
		var called = false,
			model = TestModel1.create({
				name: 'john',
				city: 'New York'
			}, $rootScope);
		var initialId = model.getKey();

		model.on('update', function () {
			called = true;
		});

		DataStore.save(model, true).then(function () {
			expect(called).toBe(true);
			expect(model.__existsRemotely).toBe(true);
			expect(model.id).not.toBe(initialId);
			done();
		});
		_d();
	});

	/*
	 .clear
	 */
	it('.clear clears the local data', function () {
		spyOn(RepositoryService.get(TestModel1), 'clear');
		DataStore.clear(TestModel1, true);
		expect(RepositoryService.get(TestModel1).clear).toHaveBeenCalledWith(true);
	});
	it('.clear clears all the repos if not passed a model', function () {
		spyOn(RepositoryService.get(TestModel1), 'clear');
		spyOn(RepositoryService.get(TestModel2), 'clear');
		DataStore.clear(true);
		expect(RepositoryService.get(TestModel1).clear).toHaveBeenCalledWith(true);
		expect(RepositoryService.get(TestModel2).clear).toHaveBeenCalledWith(true);
	});

	/*
	 .get
	 */
	it('.get can fetch data from the local repository', function (done) {
		createRemoteData();

		spyOn(RequestService, 'get').and.callThrough();
		spyOn(repo1, 'get').and.callThrough();

		DataStore.sync(TestModel1).then(function () {
			return DataStore.get(TestModel1, 1);
		}).then(function (model) {
			expect(RequestService.get).not.toHaveBeenCalled();
			expect(repo1.get).toHaveBeenCalled();
			expect(model.name).toBe('James');

			done();
		});

		_d();
	});
	it('.get will default to remote repo if no sync date', function (done) {
		createRemoteData();

		spyOn(RequestService, 'get').and.callThrough();
		spyOn(repo1, 'get').and.callThrough();

		DataStore.get(TestModel1, 1).then(function (model) {
			expect(RequestService.get).toHaveBeenCalled();
			expect(repo1.get).not.toHaveBeenCalled();
			expect(model.name).toBe('James');

			done();
		});
		_d();
	});
	it('.get can be forced to look remotely and sync data back', function (done) {
		createRemoteData();

		spyOn(RequestService, 'get').and.callThrough();
		spyOn(repo1, 'get').and.callThrough();

		DataStore.sync(TestModel1).then(function () {
			return DataStore.get(TestModel1, 1, false, true);
		}).then(function (model) {
			expect(RequestService.get).toHaveBeenCalled();
			expect(repo1.get).not.toHaveBeenCalled();
			expect(model.name).toBe('James');

			done();
		});
		_d();
	});

	it('get fails if requested online and offline', function (done) {
		RequestService.$adapter._setOnline(false);
		createRemoteData();

		DataStore.get(TestModel1, 1, false).then(function () {
			expect(true).toBe(false);
		}, function () {
			expect(true).toBe(true);
			done();
		});
		_d();
	});


	it('.get will always only look locally if $alwasySearchLocal is true', function (done) {
		DataStore.$alwaysSearchLocal = true;

		spyOn(repo1, 'get').and.callThrough();
		spyOn(RequestService, 'get').and.returnValue($q.when(null));


		DataStore.get(TestModel1, 1).then(function (data) {
			expect(repo1.get).toHaveBeenCalled();
			expect(RequestService.get).not.toHaveBeenCalled();
			expect(data).toBeNull();
			done();
		});

		_d();
	});


	/*
	 .find
	 */
	it('.find can fetch data from the local repository', function (done) {
		createRemoteData();
		var $s = $rootScope.$new();

		DataStore.sync(TestModel1).then(function () {
			return DataStore.find(TestModel1, {filter: {city: 'Newcastle'}}, $s);
		}).then(function (models) {
			expect(models.length).toBe(2);

			$s.$destroy();
			done();
		});
		_d();
	});
	it('.find will default to remote repo if no sync date', function (done) {
		createRemoteData();

		spyOn(RequestService, 'find').and.callThrough();
		spyOn(repo1, 'find').and.callThrough();

		DataStore.find(TestModel1, {filter: {city: 'Newcastle'}}).then(function (models) {
			expect(RequestService.find).toHaveBeenCalled();
			expect(repo1.find).not.toHaveBeenCalled();
			expect(models.length).toBe(2);

			done();
		});
		_d();
	});
	it('.find can be forced to look remotely and sync data back', function (done) {
		createRemoteData();

		spyOn(RequestService, 'find').and.callThrough();
		spyOn(repo1, 'find').and.callThrough();

		DataStore.sync(TestModel1).then(function () {
			return DataStore.find(TestModel1, {filter: {city: 'Newcastle'}}, false, true);
		}).then(function (models) {
			expect(RequestService.find).toHaveBeenCalled();
			expect(repo1.find).not.toHaveBeenCalled();
			expect(models.length).toBe(2);
			done();
		});
		_d();
	});
	it('.find fails if requested online and offline', function (done) {
		RequestService.$adapter._setOnline(false);
		createRemoteData();

		DataStore.find(TestModel1).then(function () {
			expect(true).toBe(false);
		}, function () {
			expect(true).toBe(true);
			done();
		});
		_d();
	});
	it('.find will always only look locally if $alwasySearchLocal is true', function (done) {
		DataStore.$alwaysSearchLocal = true;

		spyOn(repo1, 'find').and.callThrough();
		spyOn(RequestService, 'find').and.returnValue($q.when({data: []}));


		DataStore.find(TestModel1).then(function (data) {
			expect(repo1.find).toHaveBeenCalled();
			expect(RequestService.find).not.toHaveBeenCalled();
			expect(data).toEqual([]);
			done();
		});

		_d();
	});


	/*
	 .sync
	 */
	it('.sync downloads data from the remote repo and stores it locally', function (done) {
		createRemoteData();
		var repo = RepositoryService.get(TestModel1);

		DataStore.sync(TestModel1).then(function () {
			return repo.find();
		}).then(function (models) {
			expect(models.length).toBe(3);

			expect(models[0].id).toBe('1');
			expect(models[0].__existsRemotely).toBe(true);
			expect(models[0].name).toBe('James');
			expect(models[2].id).toBe('3');
			done();
		});
		_d();
	});
	it('.sync does not store any models in memory', function (done) {
		var repo = RepositoryService.get(TestModel1);
		createRemoteData();
		DataStore.sync(TestModel1).then(function () {
			expect(Object.keys(repo.$mem).length).toBe(0);
			done();
		});
		_d();
	});
	it('.sync can pass parameters from the model config to filter', function (done) {
		TestModel1.config({sync: {city: 'Newcastle'}});
		var repo = RepositoryService.get(TestModel1);

		createRemoteData();

		DataStore.sync(TestModel1).then(function () {
			return repo.find();
		}).then(function (data) {
			expect(data.length).toBe(2);
			done();
		});
		_d();

	});
	it('.sync supports non different primary keys', function (done) {
		var repo = RepositoryService.get(TestModel2);
		var m = TestModel2.create({name: 'paul', city: 'manchester'});
		var id = m.id;
		createRemoteData();

		DataStore.sync(TestModel2).then(function () {
			return DataStore.save(m);
		}).then(function () {
			return repo.find();
		}).then(function (models) {
			expect(models.length).toBe(4);
			expect(models[3].getKey()).not.toEqual(id);
			done();
		});
		_d();
	});
	it('.sync sets the updated date and can request differential updates', function (done) {
		var repo = RepositoryService.get(TestModel1),
			date = new Date(2016, 1, 1);

		createRemoteData();
		spyOn(RequestService, 'findChunked').and.callThrough();

		DataStore.sync(TestModel1).then(function () {
			return repo.updatedAt();
		}).then(function (d) {
			expect(d).not.toBeNull();

			//add some new server side data
			RequestService.$adapter.$cache.test1[0].name = "James Bond";
			RequestService.$adapter.$cache.test1[0].updatedDate = new Date(2016, 5, 5);
			RequestService.$adapter.$cache.test1.push({
				id: 99,
				name: 'Spectre',
				city: 'Paris',
				updatedDate: new Date(2016, 3, 3)
			});

			//now set it to a pretend date to mock the functionality
			return repo.updatedAt(date);
		}).then(function () {
			//do another sync

			return DataStore.sync(TestModel1);
		}).then(function () {
			//should have made the correct call to request service
			expect(RequestService.findChunked).toHaveBeenCalledWith(TestModel1, {updatedDate: date, offset: 0});
			return repo.find();
		}).then(function (models) {
			//data should have been updated
			expect(models[0].name).toBe('James Bond');
			expect(models[0].updatedDate).toEqual(new Date(2016, 5, 5));
			expect(models.length).toBe(4);
			expect(models[3].name).toBe('Spectre');

			return repo.updatedAt();
		}).then(function (newDate) {
			//time should have been updated
			expect(newDate.getTime()).toBeGreaterThan(date.getTime());
			done();
		});

		_d();
	});


	it('.sync rejects if offline', function (done) {
		RequestService.$adapter._setOnline(false);

		DataStore.sync(TestModel1).then(function () {
			expect(true).toBe(false);
		}, function () {
			expect(true).toBe(true);
			done();
		});
		_d();
	});


	/*
	 .sync does nothing if config .sync is set to false
	 */
	it('.sync does nothing if a model type is set to not sync', function (done) {
		var NoSyncModel = DataStore.create('no-sync').schema({'name': ''}).config({sync: false});

		spyOn(RequestService, 'goOnline');
		spyOn(RequestService, 'find');

		DataStore.sync(NoSyncModel).then(function () {
			expect(RequestService.goOnline).not.toHaveBeenCalled();
			expect(RequestService.find).not.toHaveBeenCalled();

			done();
		});

		_d();
	});

	//Sync All
	it('.syncAll sets a promise on the datastore that resolves when complete', function (done) {
		var p = false;
		DataStore.syncAll().then(function () {
			expect(p).toBe(true);
			done();
		});
		expect(DataStore.$syncInProgress).toBe(true);

		DataStore.$syncComplete.then(function () {
			p = true;
		});
		_d();
	});

	it('syncAll will not execute if already in progress', function (done) {
		spyOn(DataStore, 'sync').and.callThrough();

		DataStore.syncAll().then(function () {
			done();
		});

		expect(DataStore.sync.calls.count()).toBe(3);

		//should still only be 3
		DataStore.syncAll();
		expect(DataStore.sync.calls.count()).toBe(3);

		_d();

	});

	//Response to goOnline event and attempt sync (if not already online)
	it('DataStore listens to RequestService.goOnline event and starts sync', function (done) {
		spyOn(DataStore, 'syncAll').and.callThrough();

		RequestService.goOnline().then(function () {
			//a little nbit of digest hacking to get it to work in a testing situation
			setTimeout(function () {
				$timeout.flush();
				expect(DataStore.syncAll.calls.count()).toBe(1);
				done();
			});

		});

		_d();

	});

	//decorating functions
	it('.decorateFactory adds $get function onto the factory', function () {

		spyOn(DataStore, 'get');

		//the decorating should have been called by datastore as part of the .creat
		var $s = $rootScope.$new();

		TestModel1.$get("2", $s, true);
		expect(DataStore.get).toHaveBeenCalledWith(
			TestModel1,
			"2",
			$s,
			true
		);
	});
	it('.decorateFactory adds $find function onto the factory', function () {
		spyOn(DataStore, 'find');

		//the decorating should have been called by datastore as part of the .creat
		var $s = $rootScope.$new();
		var filter = {filter: {test: 'test'}};

		TestModel1.$find(filter, $s);

		expect(DataStore.find).toHaveBeenCalledWith(
			TestModel1,
			filter,
			$s
		);

	});
	it('.decorateFactory adds $sync function onto the factory', function () {

		spyOn(DataStore, 'sync');

		//the decorating should have been called by datastore as part of the .creat

		TestModel1.$sync('test');

		expect(DataStore.sync).toHaveBeenCalledWith(
			TestModel1,
			'test'
		);
	});


	it('.decorateModel adds $save, $register, $deregister and $remove functions to a model', function () {
		spyOn(DataStore, 'save');
		spyOn(DataStore, 'remove');
		spyOn(DataStore, 'registerScope');
		spyOn(DataStore, 'deregisterScope');

		var m = TestModel1.create({name: 'James'});

		m.$save(true);

		expect(DataStore.save).toHaveBeenCalledWith(
			m,
			true
		);

		m.$remove(true);

		expect(DataStore.remove).toHaveBeenCalledWith(
			m,
			true
		);

		m.$register(true);

		expect(DataStore.registerScope).toHaveBeenCalledWith(
			m,
			true
		);

		m.$deregister(true);

		expect(DataStore.deregisterScope).toHaveBeenCalledWith(
			m,
			true
		);

	});

	//RegisterScope
	it('.registerScope can register scope for a model', function () {
		spyOn(RepositoryService.get('test1'), 'registerModel');

		var $s = $rootScope.$new();
		var m1 = TestModel1.create({name: 'james'});

		DataStore.registerScope(m1, $s);

		expect(RepositoryService.get('test1').registerModel).toHaveBeenCalled();

	});

	//deregisterScope
	it('.deregisterScope can register scope for a model', function () {
		spyOn(RepositoryService.get('test1'), 'deregisterModel');

		var $s = $rootScope.$new();
		var m1 = TestModel1.create({name: 'james'});

		DataStore.deregisterScope(m1, $s);

		expect(RepositoryService.get('test1').deregisterModel).toHaveBeenCalled();

	});
	
	//startSync
	it('.startSync starts a regular syncchronisation', function () {
		spyOn(DataStore,'syncAll').and.returnValue($q.when());

		DataStore.startSync();
		$timeout.flush();

		expect(RequestService.$disableBackgroundQueueProcessing).toBe(false);

		expect(DataStore.syncAll).toHaveBeenCalled();

	});
	it('.stopSync stops synchronisation', function () {
		spyOn(DataStore,'syncAll').and.returnValue($q.when());
		DataStore.startSync();
		DataStore.stopSync();

		$timeout.flush();

		expect(RequestService.$disableBackgroundQueueProcessing).toBe(true);
		expect(DataStore.syncAll).not.toHaveBeenCalled();
	});


	/*
	 *
	 *
	 *
	 *
	 * End to End Testing of sync and transactions
	 *
	 *
	 *
	 *
	 */

	it('Can resolve IDS for has Many relationships', function (done) {
		var $s = $rootScope.$new();
		var model = TestModel1.create({firstName: 'David'}, $s);
		var pet1 = TestModelPet.create({name: 'cat', owner: model.id}, $s),
			pet2 = TestModelPet.create({name: 'dog', owner: model.id}, $s),
			pet3 = TestModelPet.create({name: 'rabbit', owner: model.id}, $s);


		DataStore.save([model, pet1, pet2, pet3], false).then(function () {
			return RequestService.$queue.resolveTransaction({id: 'ABCDE'});
		}).then(function () {
			expect(pet1.owner).toBe('ABCDE');
			expect(pet2.owner).toBe('ABCDE');
			expect(pet3.owner).toBe('ABCDE');

			done();
		});

		_d();
	});

	it('Can resolve relationships and keep models related from local to remote', function (done) {
		var $s = $rootScope.$new();
		var m1 = TestModel1.create({name: 'james'}, $s),
			m2 = TestModel1.create({name: 'bob'}, $s);

		var p1 = TestModelPet.create({name: 'Rover'}, $s),
			p2 = TestModelPet.create({name: 'Ralph'}, $s),
			p3 = TestModelPet.create({name: 'Smoke'}, $s);

		var m1ID = m1.id;
		var p1ID = p1.id;

		var update = 0;

		m1.on('update', function () {
			update++;
		});
		m2.on('update', function () {
			update++;
		});
		p1.on('update', function () {
			update++;
		});
		p2.on('update', function () {
			update++;
		});
		p3.on('update', function () {
			update++;
		});


		//don't execute immediately, to ensure that the datastore works
		DataStore.syncAll().then(function () {
			return DataStore.save([m1, m2, p1, p2, p3], false)
		}).then(function () {
			expect(m1.id).toBe(m1ID);
			return m1.$setRel('pets', [p1, p2, p3]);
		}).then(function () {
			return RequestService.next(true);
		}).then(function () {
			//by this point all the ids should have been resolved to server ids
			expect(m1.id).not.toBe(m1ID);
			expect(p1.id).not.toBe(p1ID);
			expect(p1.owner).not.toBe(m1ID);

			//4 callbacks should have been called
			expect(update).toEqual(11);

			return m1.$getRel('pets');
		}).then(function (pets) {
			expect(pets.length).toBe(3);
			expect(pets[0]).toBe(p1);
			expect(pets[1]).toBe(p2);
			expect(pets[2]).toBe(p3);

			return p1.$getRel('owner');
		}).then(function (owner) {
			expect(owner).toBe(m1);

			done();
		}, function (error) {
			//should error
			expect(error).toBeUndefined();
			expect(true).toBe(false);
			done();
		});

		_d();
	});


	/*
	 *
	 *
	 *
	 * End to End Testing of Memory Management
	 *
	 *
	 *
	 *
	 */
	it('Stores models in memory only when needed and uploads', function (done) {
		var $s1 = $rootScope.$new(),
			$s2 = $rootScope.$new(),
			$s3 = $rootScope.$new();

		var m1 = TestModel1.create({name: 'james'}, $s1),
			m2 = TestModel1.create({name: 'bob'}, $s1);

		var p1 = TestModelPet.create({name: 'Rover'}, $s1),
			p2 = TestModelPet.create({name: 'Ralph'}, $s1),
			p3 = TestModelPet.create({name: 'Smoke'}, $s1);

		var repo1 = RepositoryService.get('test1'),
			repoPet = RepositoryService.get('pet');


		expect(Object.keys(repo1.$mem).length).toBe(2);

		DataStore.syncAll().then(function () {
			/*
			 * Ensure in memory
			 */
			expect(Object.keys(repo1.$mem).length).toBe(2);
			return DataStore.save([m1, m2]);
		}).then(function () {
			$s1.$destroy();
			/*
			 * When scope is destroyed, should all be out of memory
			 */
			expect(Object.keys(repo1.$mem).length).toBe(0);
			expect(Object.keys(repoPet.$mem).length).toBe(0);

			return m1.$setRel('pets', [p1, p2, p3]);
		}).then(function () {
			//should still be nothing
			expect(Object.keys(repo1.$mem).length).toBe(0);
			expect(Object.keys(repoPet.$mem).length).toBe(0);

			return DataStore.find(TestModel1, {}, $s2);
		}).then(function (found) {

			expect(found.length).toBe(2);

			//should now be in scope
			expect(Object.keys(repo1.$mem).length).toBe(2);

			//relationships
			return found[0].$getRel('pets', $s3);
		}).then(function (pets) {
			expect(pets.length).toBe(3);

			expect(Object.keys(repo1.$mem).length).toBe(2);
			expect(Object.keys(repoPet.$mem).length).toBe(3);

			//destroy scopes
			$s2.$destroy();
			expect(Object.keys(repo1.$mem).length).toBe(0);
			expect(Object.keys(repoPet.$mem).length).toBe(3);

			$s3.$destroy();
			expect(Object.keys(repo1.$mem).length).toBe(0);
			expect(Object.keys(repoPet.$mem).length).toBe(0);


			done();

		});

		_d();
	});


});