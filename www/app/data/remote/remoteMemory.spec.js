describe('saferota.data RemoteAdaptorMemory', function () {

	var remote;

	beforeEach(module('saferota.data'));

	beforeEach(inject(function (RemoteAdapterMemory) {
		remote = new RemoteAdapterMemory({config: 'test'});
	}));

	it('Can create new adaptor', function () {
		expect(remote.$cache).toEqual([]);
	});
	it('Can set config values', function () {
		expect(remote._config.config).toEqual('test');
	});

	/*
	.get / find
	 */
	it('Can get a value by id', function (done) {
		inject(function ($rootScope) {
			remote.$cache = [
				{id: 1, name: 'test'},
				{id: 2, name: 'james'}
			];

			remote.get(2).then(function (data) {
				expect(data.id).toEqual(2);
				done();
			});
			$rootScope.$digest();
		});
	});

	/*
	.save
	 */
	it('Can save a model into the array', function (done) {
		inject(function ($rootScope,Model) {
			var Test = new Model('test').schema({name: 'default'}).key('id');

			var m = Test.create({id: 2});

			remote.save(m).then(function(){
				expect(remote.$cache[0].id).toEqual(2);
				done();
			});
			$rootScope.$digest();
		});
	});
	
	/*
	.update
	 */
	it('Can save a model into the array', function (done) {
		inject(function ($rootScope,Model) {
			var Test = new Model('test').schema({name: 'default'}).key('id');

			var m1 = Test.create({id: 2});
			var m2 = Test.create({id: 5});
			var m3 = Test.create({id: 10});

			remote.save([m1,m2,m3]).then(function(){
				m2.name = 'new name';
				return remote.update(m2);
			}).then(function(){
				expect(remote.$cache[1].name).toEqual('new name');
				done();
			});
			$rootScope.$digest();
		});
	});

	/*
	.remove
	 */
	it('Can remove a model from the array', function (done) {
		inject(function ($rootScope,Model) {
			var Test = new Model('test').schema({name: 'default'});
			var m1 = Test.create({id: 2});
			var m2 = Test.create({id: 5});
			var m3 = Test.create({id: 10});

			remote.save([m1,m2,m3]).then(function(){
				m2.name = 'new name';
				return remote.remove(m2);
			}).then(function(model){
				expect(remote.$cache.length).toBe(2);
				expect(model.id).toEqual(5);
				done();
			});
			$rootScope.$digest();
		});
	});




});