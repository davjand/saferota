describe('saferota.data LocalAdpatorLocalForage', function () {
	beforeEach(module('saferota.data'));

	var local, $rootScope;

	/*
	 A little helper function to trigger digests

	 Because this is actually an integration test with LocalForage
	 We have to go to the database and back so we need to wait before triggering the digest loop
	 as the promises aren't automatically resolved.

	 */
	var _digest = function(no, interval) {
		no = no || 1;
		interval = interval || 50;

		for (var i = 1; i <= no; i++) {
			setTimeout($rootScope.$digest, i * interval);
		}
	};


	/*
	 Allow to create
	 */
	beforeEach(function () {
		inject(function (LocalAdapterLocalForage, _$rootScope_) {
			$rootScope = _$rootScope_;
			local = new LocalAdapterLocalForage({name: 'test'});
		});
	});

	//clear After
	afterEach(function (done) {
		local.clear().then(function () {
			done();
		});
		_digest(2);
	});

	/*
	 Can create / store / get parameters
	 */
	it('Can create new cache and save data into it', function (done) {

		local.set('name', 'John').then(function () {
			return local.get('name');
		}).then(function (data) {
			expect(data).toEqual('John');
			done();
		});
		_digest(4);
	});

	/*
	 .configKey
	 */
	it('Can set a configuration key', function (done) {
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
			done();
		});
		_digest(8);

	});

	/*
	 .updatedAt (Date)
	 */
	it('Can get / set the updated date', function (done) {
		var date = new Date();

		local.updatedAt(date).then(function () {
			return local.updatedAt();
		}).then(function (returnedDate) {
			expect(date).toEqual(returnedDate);
			done();
		});

		_digest(6);
	});

	/*
	 .data - get multiple
	 */
	it('data function get get multiple data when passed an array', function (done) {
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
			done();
		});

		_digest(4);
	});

	/*
	 .remove
	 */
	it('Can remove data from the cache', function (done) {
		local.data('test', 'testData').then(function () {
			return local.remove('test');
		}).then(function () {
			return local.length();
		}).then(function(len){
			expect(len).toEqual(0);
			done();
		});
		_digest(6);
	});


	/*
	 .length
	 */
	it('Can determine the length of the stored items', function (done) {
		local.data({
			key1: 'test1',
			key2: 'test2',
			key3: 'test3'
		}).then(function () {
			return local.length();
		}).then(function (l) {
			expect(l).toEqual(3);
			done();
		});
		_digest(4);
	});

	/*
	 .clear
	 */
	it('Can clear the cache', function (done) {
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
			done();
		});
		_digest(6);
	});




	/*
	 .keys
	 */
	it('Can retrieve the keys', function (done) {
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
			done();
		});
		_digest(4);
	});
});