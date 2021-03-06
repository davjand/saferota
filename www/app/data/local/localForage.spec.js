describe('saferota.data LocalAdpatorLocalForage', function () {
	beforeEach(module('saferota.data'));

	var local, $rootScope, LocalAdapterLocalForage, ModelService, $q;

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
	var _digest = function (d) {
		var interval = 5;

		var fx = function () {
			if (!d.done) {
				$rootScope.$digest();
				setTimeout(fx, interval);
			}
		};
		fx();
	};


	/*
	 Allow to create
	 */
	beforeEach(inject(function (_LocalAdapterLocalForage_, _$rootScope_, _ModelService_, _$q_) {
		LocalAdapterLocalForage = _LocalAdapterLocalForage_;
		$rootScope = _$rootScope_;
		ModelService = _ModelService_;
		$q = _$q_;

		local = new LocalAdapterLocalForage({name: 'test'});
	}));


	//clear After
	afterEach(function () {
		local.clear();
	});

	/*
	 Can create / store / get parameters
	 */
	it('Can create new cache and save data into it', function (done) {
		var d = {done: false};

		local.set('name', 'John').then(function () {
			return local.get('name');
		}).then(function (data) {
			expect(data).toEqual('John');
			d.done = true;
			done();
		});
		_digest(d);
	});

	/*
	 .configKey
	 */
	it('Can set a configuration key', function (done) {
		var d = {done: false};
		local.config({
			setting1: 'a',
			setting2: 'b'
		}).then(function () {
			return local.configKey('setting1', 'd');
		}).then(function () {
			return local.configKey('setting2');
		}).then(function (value) {
			expect(value).toEqual('b');
			return local.configKey('setting1');
		}).then(function (value) {
			expect(value).toEqual('d');
			d.done = true;
			done();
		});
		_digest(d);

	});

	/*
	 .updatedAt (Date)
	 */
	it('Can get / set the updated date', function (done) {
		var d = {done: false};
		var date = new Date();

		local.updatedAt(date).then(function () {
			return local.updatedAt();
		}).then(function (returnedDate) {
			expect(date).toEqual(returnedDate);
			d.done = true;
			done();
		});

		_digest(d);
	});

	/*
	 .data - get multiple
	 */
	it('data function get get multiple data when passed an array', function (done) {
		var d = {done: false};
		local.data({
			key1: 'test1',
			key2: 'test2',
			key3: 'test3'
		}).then(function () {
			return local.data(['key1', 'key3']);
		}).then(function (data) {
			expect(Object.keys(data).length).toEqual(2);
			expect(data['key1']).toEqual('test1');
			expect(data['key3']).toEqual('test3');
			d.done = true;
			done();
		});

		_digest(d);
	});

	/*
	 .remove
	 */
	it('Can remove data from the cache', function (done) {
		var d = {done: false};
		local.data('test', 'testData').then(function () {
			return local.remove('test');
		}).then(function () {
			return local.length();
		}).then(function (len) {
			expect(len).toEqual(0);
			d.done = true;
			done();
		});
		_digest(d);
	});


	/*
	 .length
	 */
	it('Can determine the length of the stored items', function (done) {
		var d = {done: false};
		local.data({
			key1: 'test1',
			key2: 'test2',
			key3: 'test3'
		}).then(function () {
			return local.length();
		}).then(function (l) {
			expect(l).toEqual(3);
			d.done = true;
			done();
		});
		_digest(d);
	});

	/*
	 .clear
	 */
	it('Can clear the cache', function (done) {
		var d = {done: false};

		local.data({
			key1: 'test1',
			key2: 'test2',
			key3: 'test3'
		}).then(function () {
			return local.clear();
		}).then(function () {
			return local.length();
		}).then(function (l) {
			expect(l).toEqual(-1);
			d.done = true;
			done();
		});
		_digest(d);
	});

	/*
	 .filter
	 */
	var Model, m1, m2, m3, m4, m5, m6;

	//Helper function to create and save data
	function createFilterData(saveData) {
		Model = ModelService.create('test')
			.schema({name: '', city: ''})
			.key('objectId');

		m1 = Model.create({name: 'James', city: 'Newcastle'});
		m2 = Model.create({name: 'David', city: 'Newcastle'});
		m3 = Model.create({name: 'Fred', city: 'Newcastle'});
		m4 = Model.create({name: 'James', city: 'London'});
		m5 = Model.create({name: 'David', city: 'London'});
		m6 = Model.create({name: 'Fred', city: 'London'});

		//save all the data into
		saveData = typeof saveData !== 'undefined' ? safeDave : true;
		if (saveData) {
			var indexedModels = {};
			angular.forEach([m1, m2, m3, m4, m5, m6], function (item) {
				indexedModels[item.getKey()] = item;
			});
			return local.data(indexedModels);
		}
		return $q.when();
	}

	it('.filter can get all items', function (done) {
		var d = {done: false};

		createFilterData().then(function () {
			return local.filter();
		}).then(function (data) {
			expect(data.length).toBe(6);
			d.done = true;
			done();
		});
		_digest(d);
	});
	it('.filter does not return config', function (done) {
		var d = {done: false};
		local.setConfig({test: 'test'}).then(function () {
			return createFilterData();
		}).then(function () {
			return local.filter();
		}).then(function (data) {
			expect(data.length).toBe(6);
			d.done = true;
			done();
		});
		_digest(d);
	});
	it('.filter can filter the objects', function (done) {
		var d = {done: false};
		createFilterData().then(function () {
			return local.filter({name: 'David'});
		}).then(function (data) {
			expect(data.length).toBe(2);
			d.done = true;
			done();
		});
		_digest(d);
	});



	/*
	 .keys
	 */
	it('Can retrieve the keys', function (done) {
		var d = {done: false};

		local.data({
			key1: 'test1',
			key2: 'test2',
			key3: 'test3',
			key4: 'test2'
		}).then(function () {
			return local.keys();
		}).then(function (keys) {
			expect(keys[0]).toBe('key1');
			expect(keys[2]).toBe('key3');
			expect(keys[3]).toBe('key4');
			d.done = true;
			done();
		});
		_digest(d);
	});
});