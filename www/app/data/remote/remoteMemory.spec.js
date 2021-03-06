describe('saferota.data RemoteAdaptorMemory', function () {

	var remote, ModelService, $rootScope, TestModel, m1, m2, m3;

	beforeEach(module('saferota.data'));

	beforeEach(inject(function (RemoteAdapterMemory, _ModelService_, _$rootScope_) {
		ModelService = _ModelService_;
		$rootScope = _$rootScope_;

		TestModel = ModelService.create('test').schema({name: 'default'}).key('id');
		remote = new RemoteAdapterMemory({config: 'test'});

		m1 = TestModel.create({id: 2});
		m2 = TestModel.create({id: 5});
		m3 = TestModel.create({id: 10});
	}));

	afterEach(function () {
		ModelService.clear();
	});

	it('Can create new adaptor', function () {
		expect(remote.$cache).toEqual({});
	});
	it('Can set config values', function () {
		expect(remote._config.config).toEqual('test');
	});

	it('_.getCache creates or gets a cache', function () {
		remote._getCache('test');
		remote._getCache('test2');
		expect(remote.$cache['test']).toEqual([]);
		expect(remote.$cache['test2']).toEqual([]);

		//retrieve an existing
		remote.$cache['test'].push('test');
		expect(remote._getCache('test').length).toBe(1);
	});


	/*
	 .get / find
	 */
	it('Can get a value by id', function (done) {
		remote.$cache.test = [
			{id: 1, name: 'test'},
			{id: 2, name: 'james'}
		];

		remote.get(TestModel, 2).then(function (data) {
			expect(data.id).toEqual(2);
			done();
		});
		$rootScope.$digest();
	});

	/*
	 .find
	 */
	function buildFindData() {
		remote.$cache.test = [
			{id: 1, name: 'david', town: 'newcastle'},
			{id: 2, name: 'john', town: 'newcastle'},
			{id: 3, name: 'paul', town: 'newcastle'},
			{id: 4, name: 'david', town: 'london'},
			{id: 5, name: 'paul', town: 'london'},
			{id: 6, name: 'john', town: 'glasgow'},
			{id: 7, name: 'david', town: 'glasgow'},
			{id: 8, name: 'paul', town: 'glasgow'}
		];
	}


	it('.find can filter by an array of values', function (done) {
		buildFindData();

		remote.find(TestModel, {
			filter: {
				name: ['david', 'john']
			}
		}).then(function (data) {
			expect(data.length).toBe(5);

			return remote.find(TestModel, {
				filter: {
					town: ['newcastle', 'london'],
					name: 'paul'
				}
			});
		}).then(function (data) {
			expect(data.length).toBe(2);
			done();
		});

		$rootScope.$digest();
	});

	it('.find has support for pagination', function (done) {
		buildFindData();
		remote.find(TestModel, {
			limit: 2,
			offset: 2
		}).then(function (data) {
			expect(data.data.length).toBe(2);
			expect(data.length).toBe(2);
			expect(data.count).toBe(8);
			expect(data.offset).toBe(2);

			expect(data.data[0].id).toBe(3);
			expect(data.data[1].id).toBe(4);

			done();
		});
		$rootScope.$digest();
	});


	/*
	 .save
	 */
	it('Can save a model into the array', function (done) {
		var m = TestModel.create({id: 2});

		remote.save(m).then(function (resolved) {
			expect(remote.$cache.test[0].id).toEqual(resolved.id);
			done();
		});
		$rootScope.$digest();
	});
	it('Can generate a remote ID for items', function (done) {
		var m = TestModel.create({id: 2});

		remote.save(m).then(function (data) {
			expect(data.id).toBeDefined();
			expect(data.id).not.toBe(2);
			done();
		});
		$rootScope.$digest();
	});


	/*
	 .update
	 */
	it('Can save a model into the array', function (done) {


		remote.save([m1, m2, m3]).then(function (data) {
			m2.setData(data[1]);

			m2.name = 'new name';
			return remote.update(m2);
		}).then(function () {
			expect(remote.$cache.test[1].name).toEqual('new name');
			done();
		});
		$rootScope.$digest();
	});

	/*
	 .remove
	 */
	it('Can remove a model from the array', function (done) {
		remote.save([m1, m2, m3]).then(function (resolved) {
			m2.setData(resolved[1]);
			m2.name = 'new name';
			return remote.remove(m2);
		}).then(function () {
			expect(remote.$cache.test.length).toBe(2);
			done();
		});
		$rootScope.$digest();
	});

	/*
	 ._setOnline
	 */
	it('_setOnline can set the online status', function () {
		expect(remote.$online).toBe(true);

		remote._setOnline(false);
		expect(remote.$online).toBe(false);

		remote._setOnline(true);

		expect(remote.$online).toBe(true);
	});

	/*
	 .online
	 */
	it('.online resolves a promise if online', function (done) {
		remote.online().then(function () {
			expect(true).toBe(true);
			done();
		}, function () {
			expect(false).toBe(true);
		});

		$rootScope.$digest();
	});
	it('.online rejects a promise if not online', function (done) {
		remote._setOnline(false);

		remote.online().then(function () {
			expect(false).toBe(true);
		}, function () {
			expect(true).toBe(true);
			done();
		});

		$rootScope.$digest();
	});

});