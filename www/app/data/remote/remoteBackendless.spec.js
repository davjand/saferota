/*
 *
 * DISABLE by Default as is E2E Testing
 *
 */
xdescribe('saferota.data RemoteAdapterBackendless', function () {

	var remote, ModelService, $rootScope, TestModel, $q,
		m1, m2, m3,
		Backendless = window.Backendless;

	/*

	 A little helper function to trigger digests

	 Because this is actually an integration test with LocalForage
	 We have to go to the database and back so we need to wait before triggering the digest loop
	 as the promises aren't automatically resolved.

	 We use the code

	 var d = {done: false}

	 This creates an object (so passed by reference) to a flag
	 When the flag is then set to true, the digest function stops executing
	 It will keep executing until all the promises have been resolved

	 */
	var _digest = function (d, interval) {
		interval = interval || 5;

		var fx = function () {
			if (!d.done) {
				$rootScope.$digest();
				setTimeout(fx, interval);
			}
		};
		fx();
	};
	/*
	 Simpler version
	 */
	function _d() {
		$rootScope.$digest();
	}


	beforeEach(module('saferota.data'));


	/*
	 * Setup the Data
	 */
	beforeEach(inject(function (RemoteAdapterBackendless, _ModelService_, _$rootScope_, _$q_) {
		ModelService = _ModelService_;
		$rootScope = _$rootScope_;
		$q = _$q_;

		/*
		 Setup Schema
		 */
		TestModel = ModelService.create('TestModel').schema({
			name: '',
			city: ''
		}).key('objectId');

		/*
		 Create new remote
		 */
		remote = new RemoteAdapterBackendless({
			//this is for a sample backendless database that is setup with the Schema above
			application: 'C05516F9-B207-281E-FF2A-0B95AE494100',
			secret: '7DBD6F4D-79AB-FCE1-FF51-374FAE297D00',
			version: 'v1'
		});


	}));

	/*
	 * Clear
	 *
	 */
	afterEach(function () {
		ModelService.clear();
	});


	it('Can set config values', function () {
		expect(remote._config.version).toEqual('v1');
	});

	/*
	 Convert our models to the type accepted by Backendless
	 */
	it('Can convert model structure into backendless objects', function () {
		var object = Backendless.Persistence.of(
			remote._getClass(TestModel)
		);
		expect(object).not.toBeNull();
	});


	/*
	 _wrapPromise
	 */
	it('Can wrap a backendless function into an angular promise', function (done) {
		spyOn(Backendless.Persistence.of(remote._getClass(TestModel)), 'findById').and.callFake(function (param1, param2) {
			//passed the correct params
			expect(param1).toBe(10);
			//async function
			expect(angular.isFunction(param2.success)).toBe(true);
			expect(angular.isFunction(param2.fault)).toBe(true);

			param2.success('test');
		});

		remote._wrapPromise(
			Backendless.Persistence.of(remote._getClass(TestModel)),
			'findById',
			10
		).then(function (data) {
			expect(data).toBe('test'); //should pass the data through
			expect(true).toBe(true); //this should be called
			done();
		});

		_d();
	});
	it('Can wrap a backendless function into an angular promise and reject if an error', function (done) {
		spyOn(Backendless.Persistence.of(remote._getClass(TestModel)), 'findById').and.callFake(function (param1, param2) {
			//passed the correct params
			expect(param1).toBe(10);
			//async function
			expect(angular.isFunction(param2.success)).toBe(true);
			expect(angular.isFunction(param2.fault)).toBe(true);

			param2.fault('test');
		});

		remote._wrapPromise(
			Backendless.Persistence.of(remote._getClass(TestModel)),
			'findById',
			10
		).then(function () {
			expect(true).toBe(false); //this should NOT be called
		}, function (data) {
			expect(data).toBe('test'); //should pass the data through
			expect(true).toBe(true); //this should be called
			done();
		});

		_d();
	});

	/*
	 _bulkDelete
	 */
	it('Can bulk delete', function (done) {
		var d = {done: false};

		//allow bulk deletes
		remote._bulkDelete(TestModel).then(function () {
			d.done = true;
			done();
		});
		_digest(d, 100);
	});


	/*
	 .save / .get
	 */
	it('.save a model and then retrieve it with .get', function (done) {
		var d = {done: false};

		var m1 = TestModel.create({
			name: 'James',
			city: 'Newcastle'
		});
		remote.save(m1).then(function (data) {
			return remote.get(TestModel, data.objectId);
		}).then(function (data) {
			expect(data.name).toEqual('James');
			expect(data.city).toEqual('Newcastle');
			expect(data.updatedDate).not.toBeNull();
			expect(data.createdDate).not.toBeNull();
			d.done = true;
			done();
		}, function (error) {
			expect(false).toBe(true);
			done();
		});

		_digest(d, 100);

	});


	/*
	 *
	 *
	 * Clear the server and setup some sample data
	 *
	 *
	 */
	function sampleData() {
		var m1 = TestModel.create({
				name: 'David',
				city: 'Newcastle'
			}),
			m2 = TestModel.create({
				name: 'John',
				city: 'Newcastle'
			}),
			m3 = TestModel.create({
				name: 'Paul',
				city: 'Newcastle'
			}),
			m4 = TestModel.create({
				name: 'David',
				city: 'London'
			}),
			m5 = TestModel.create({
				name: 'John',
				city: 'London'
			});

		return remote._bulkDelete(TestModel).then(function () {
			return $q.all([
				remote.save(m1),
				remote.save(m2),
				remote.save(m3),
				remote.save(m4),
				remote.save(m5)
			]);
		});
	}

	/*
	 .find
	 */
	it('Can find all', function () {
		var d = {done: false};

		//clear first
		sampleData().then(function () {
			return remote.find(TestModel);
		}).then(function (data) {
			expect(data.length).toBe(5);
			d.done = true;
			done();
		});

		_digest(d, 100);
	});
	it('Can find data using simple filter function', function (done) {
		var d = {done: false};

		//clear first
		sampleData().then(function () {
			return remote.find(TestModel, {filter: {name: 'David'}});
		}).then(function (data) {
			expect(data.length).toBe(2);
			d.done = true;
			done();
		}, function (error) {
			expect(false).toBe(true);

			d.done = true;
			done();
		});

		_digest(d, 100);

	});

	it('.find can filter by an array of values', function (done) {
		var d = {done: false};

		//clear first
		sampleData().then(function () {
			return remote.find(TestModel, {filter: {name: ['David', 'John']}});
		}).then(function (data) {
			expect(data.length).toBe(4);
			d.done = true;
			done();
		});

		_digest(d, 100);
	});

	it('.find can filter by multiple values', function (done) {
		var d = {done: false};

		//clear first
		sampleData().then(function () {
			return remote.find(TestModel, {filter: {name: ['David', 'John'], city: 'Newcastle'}});
		}).then(function (data) {
			expect(data.length).toBe(2);
			d.done = true;
			done();
		});

		_digest(d, 100);
	});

	/*
	 .update
	 */
	it('.update can save a model', function (done) {
		var d = {done: false},
			id = null,
			m1 = TestModel.create({
				name: 'James',
				city: 'Newcastle'
			});
		remote.save(m1).then(function (data) {
			id = data.objectId;
			m1.setData(data);
			m1.name = 'John';
			return remote.update(m1);
		}).then(function () {
			return remote.get(TestModel, id);
		}).then(function (data) {
			expect(data.name).toBe('John');
			d.done = true;
			done();
		});
		_digest(d, 50);
	});

	/*
	 .remove
	 */
	it('Can remove a model ', function (done) {
		var d = {done: false},
			id = null,
			m1 = TestModel.create({
				name: 'James',
				city: 'Newcastle'
			});
		remote.save(m1).then(function (data) {
			m1.setData(data);
			id = data.objectId;
			return remote.remove(m1);
		}).then(function () {
			return remote.get(TestModel, id);
		}).then(function () {
			expect(true).toBe(false);
		}, function () {
			//should error
			expect(true).toBe(true);
			d.done = true;
			done();
		});
		_digest(d, 50);
	});

	/*
	 .online
	 */
	it('.online resolves a promise if online', function (done) {
		var d = {done: false};

		remote.online().then(function () {
			expect(true).toBe(true);
			done();
		}, function () {
			expect(false).toBe(true);
			done();
		});
		_digest(d, 50);
	});


});