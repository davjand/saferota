describe('saferota.data LocalAdapterMemory', function () {
	beforeEach(module('saferota.data'));

	var local;

	beforeEach(inject(function (LocalAdapterMemory) {
		local = new LocalAdapterMemory();
	}));

	afterEach(inject(function () {
		local.clear();
	}));


	it('Can create a new in memory array', inject(function () {
		expect(local.$cache).toEqual({});
		expect(local.$config).toEqual({});
	}));

	/*
	.configKey
	 */
	it('Can set a configuration key', function(done){
		inject(function($rootScope){
			local.config({
				setting1: 'a',
				setting2: 'b'
			}).then(function(){
				return local.configKey('setting1','d');
			}).then(function(){
				return local.configKey('setting2');
			}).then(function(value){
				expect(value).toEqual('b');
				return local.configKey('setting1');
			}).then(function(value){
				expect(value).toEqual('d');
				done();
			});
			$rootScope.$digest();
		});
	});

	/*
	 .updatedAt (Date)
	 */
	it('Can get / set the updated date', function(done){
		inject(function($rootScope){
			var date = new Date();

			local.updatedAt(date).then(function(){
				return local.updatedAt();
			}).then(function(returnedDate){
				expect(date).toEqual(returnedDate);
				done();
			});

			$rootScope.$digest();
		});
	});




	/*
	 .setData / .getData
	 */
	it('Can set data into the cache', function (done) {
			inject(function ($rootScope) {
				local.data('test', 'testData').then(function () {
					return local.data('test');
				}).then(function (data) {
					expect(data).toEqual('testData');
					done();
				});
				$rootScope.$digest();
			});
		}
	);

	/*
	.data - set multiple
	 */
	it('data function can set multiple data when passed an object', function(done){
		inject(function($rootScope){
			local.data({
				key1: 'test1',
				key2: 'test2',
				key3: 'test3'
			}).then(function(){
				expect(local.$cache['key1']).toEqual('test1');
				expect(local.$cache['key2']).toEqual('test2');
				expect(local.$cache['key3']).toEqual('test3');
				done();
			});
			$rootScope.$digest();
		});
	});
	/*
	.data - get multiple
	 */
	it('data function get get multiple data when passed an array', function (done) {
		inject(function($rootScope){
			local.data({
				key1: 'test1',
				key2: 'test2',
				key3: 'test3'
			}).then(function(){
				return local.data(['key1','key3']);
			}).then(function(data){
				expect(Object.keys(data).length).toEqual(2);
				expect(data['key1']).toEqual('test1');
				expect(data['key3']).toEqual('test3');
				done();
			});

			$rootScope.$digest();
		});
	});

	/*
	 .remove
	 */
	it('Can remove and return data from the cache', function (done) {
		inject(function ($rootScope) {
			local.data('test', 'testData').then(function(){
				return local.remove('test');
			}).then(function(data){
				//should return row
				expect(data).toEqual('testData');
				return local.length();
			}).then(function(len){
				expect(len).toEqual(0);
				done();
			});
			$rootScope.$digest();
		});
	});

	/*
	 .config
	 */
	it('Can set and get config values', function (done) {
		inject(function ($rootScope) {
			local.config({key: 'configValue'}).then(function(){
				return local.config();
			}).then(function(c){
				expect(c.key).toEqual('configValue');
				done();
			});
			$rootScope.$digest();
		});
	});

	/*
	 .length
	 */
	it('Can determine the length of the stored items', function (done) {
		inject(function($rootScope){
			local.data({
				key1: 'test1',
				key2: 'test2',
				key3: 'test3'
			}).then(function(){
				return local.length();
			}).then(function(l){
				expect(l).toEqual(3);
				done();
			});
			$rootScope.$digest();
		});
	});

	/*
	 .clear
	 */
	it('Can clear the cache', function (done) {
		inject(function($rootScope){
			local.data({
				key1: 'test1',
				key2: 'test2',
				key3: 'test3'
			}).then(function(){
				return local.clear();
			}).then(function(){
				return local.length();
			}).then(function(l){
				expect(l).toEqual(0);
				done();
			});
			$rootScope.$digest();
		});
	});


	/*
	 .each
	 */
	it('Can filter the data using the iterator function', function (done) {
		inject(function($rootScope){
			local.data({
				key1: 'test1',
				key2: 'test2',
				key3: 'test3',
				key4: 'test2'
			}).then(function(){
				return local.filter(function(value,key){
					return value === 'test2'
				});
			}).then(function(data){
				expect(Object.keys(data).length).toEqual(2);
				expect(data['key2']).toEqual('test2');
				expect(data['key4']).toEqual('test2');
				done();
			});
			$rootScope.$digest();
		});
	});
});