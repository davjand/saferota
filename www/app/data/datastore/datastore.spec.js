describe('saferota.data DataStore', function () {
	beforeEach(module('saferota.data'));

	var DataStore, RepositoryService, ModelService, RequestService, $rootScope,
		TestModel1, TestModel2,
		repo1;

	beforeEach(inject(function (_DataStore_, _RepositoryService_, _ModelService_, _RequestService_, _$rootScope_) {
		DataStore = _DataStore_;
		RepositoryService = _RepositoryService_;
		ModelService = _ModelService_;
		RequestService = _RequestService_;
		$rootScope = _$rootScope_;

		TestModel1 = DataStore.create('test1').schema({name: '', city: ''});
		TestModel2 = DataStore.create('test2').schema({name: '', city: ''}).key('objectId');

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
			spyOn(RequestService, 'find').and.callThrough();
			return DataStore.sync(TestModel1);
		}).then(function () {
			//should have made the correct call to request service
			expect(RequestService.find).toHaveBeenCalledWith(TestModel1, {updatedAt: date});
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

	


});