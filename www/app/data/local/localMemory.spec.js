describe('saferota.data LocalAdapterMemory', function () {
	beforeEach(module('saferota.data'));

	var local, $rootScope;

	beforeEach(inject(function (LocalAdapterMemory, _$rootScope_) {
		$rootScope = _$rootScope_;
		local = new LocalAdapterMemory();
	}));

	afterEach(inject(function () {
		local.clear();
	}));


	it('Can create a new in memory array', function () {
		expect(local.$cache).toEqual({});
		expect(local.$config).toEqual({});
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
		$rootScope.$digest();
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

		$rootScope.$digest();
	});


	/*
	 .setData / .getData
	 */
	it('Can set data into the cache', function (done) {
		local.data('test', 'testData').then(function () {
			return local.data('test');
		}).then(function (data) {
			expect(data).toEqual('testData');
			done();
		});
		$rootScope.$digest();
	});

	it('getData returns null if not found', function (done) {
		local.data('test').then(function (data) {
			expect(data).toBeNull();
			done();
		});
		$rootScope.$digest();
	});

	/*
	 .data - set multiple
	 */
	it('data function can set multiple data when passed an object', function (done) {
		local.data({
			key1: 'test1',
			key2: 'test2',
			key3: 'test3'
		}).then(function () {
			expect(local.$cache['key1']).toEqual('test1');
			expect(local.$cache['key2']).toEqual('test2');
			expect(local.$cache['key3']).toEqual('test3');
			done();
		});
		$rootScope.$digest();
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

		$rootScope.$digest();
	});

	/*
	 .remove
	 */
	it('Can remove and return data from the cache', function (done) {
		local.data('test', 'testData').then(function () {
			return local.remove('test');
		}).then(function (data) {
			//should return row
			expect(data).toEqual('testData');
			return local.length();
		}).then(function (len) {
			expect(len).toEqual(0);
			done();
		});
		$rootScope.$digest();
	});

	/*
	 .config
	 */
	it('Can set and get config values', function (done) {
		local.config({key: 'configValue'}).then(function () {
			return local.config();
		}).then(function (c) {
			expect(c.key).toEqual('configValue');
			done();
		});
		$rootScope.$digest();
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
		$rootScope.$digest();
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
			expect(l).toEqual(0);
			done();
		});
		$rootScope.$digest();
	});


	/*
	 .filter - standard values
	 */
	it('Can filter the data using the iterator function', function (done) {
		local.data({
			key1: 'test1',
			key2: 'test2',
			key3: 'test3',
			key4: 'test2'
		}).then(function () {
			return local.filter('test2');
		}).then(function (data) {
			expect(Object.keys(data).length).toEqual(2);
			expect(data[0]).toEqual('test2');
			expect(data[1]).toEqual('test2');
			done();
		});
		$rootScope.$digest();
	});
	/*
	 .filter - objects
	 */
	var filterData = {
		1: {
			firstName: 'james',
			lastName: 'doe',
			age: 5
		},
		2: {
			firstName: 'david',
			lastName: 'dean',
			age: 10
		},
		3: {
			firstName: 'robert',
			lastName: 'dean',
			age: 15
		},
		4: {
			firstName: 'paul',
			lastName: 'doe',
			age: 20
		},
		5: {
			firstName: 'john',
			lastName: 'doe',
			age: 10
		},
		6: {
			firstName: 'luke',
			lastName: 'doe',
			age: 5
		}
	};

	it('Can filter the data using a filter object and logic', function (done) {
		local.data(filterData).then(function () {
			//filter by fistname
			return local.filter({firstName: 'james'});
		}).then(function (data) {

			expect(data.length).toBe(1);
			expect(data[0].firstName).toBe('james');
			expect(data[0].age).toBe(5);
			expect(data[0].lastName).toBe('doe');

			//filter by age
			return local.filter({age: 10})
		}).then(function (data) {
			expect(data.length).toBe(2);

			//filter by 2 parameters
			return local.filter({age: 10, lastName: 'doe'});
		}).then(function (data) {
			expect(data.length).toBe(1);

			//returns an empty array
			return local.filter({age: 200});
		}).then(function (data) {
			expect(data.length).toBe(0);

			//get multiple by surname
			return local.filter({age: 5, lastName: 'doe'});
		}).then(function (data) {
			expect(data.length).toBe(2);
			expect(data[0].firstName).toBe('james');
			expect(data[1].firstName).toBe('luke');

			done();
		});

		$rootScope.$digest();

	});

	/*
	 .filter comma seperated values
	 */
	it('Can filter multiple values by CSV', function (done) {
		local.data(filterData).then(function () {
			return local.filter({age: [10, 15]});
		}).then(function (data) {
			expect(data.length).toBe(3);

			return local.filter({firstName: ['james', 'david']});
		}).then(function (data) {
			expect(data.length).toBe(2);
			done();
		});

		$rootScope.$digest();
	});


	/*
	 .filter OR
	 */
	it('Can filter by OR logic', function (done) {
		local.data(filterData).then(function () {
			return local.filter({
				age: 10,
				firstName: 'robert',
				$logic: 'OR'
			});
		}).then(function (data) {
			expect(data.length).toBe(3);
			done();
		});
		$rootScope.$digest();
	});


	/*
	 .keys
	 */

	it('Can get the array keys', function (done) {
		inject(function ($rootScope) {
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
			$rootScope.$digest();
		});
	});
});