describe('saferota.data Repository', function () {
	beforeEach(module('saferota.data'));

	var repo, TestModel;

	beforeEach(inject(function (Model, Repository) {
		TestModel = new Model('TestModel').schema({name: 'default'});
		repo = new Repository(TestModel, 'LocalAdapterMemory', 'RemoteAdapterMemory');

		var m1 = TestModel.create({
				id: 1,
				name: 'James',
				updatedDate: new Date(2015,1,1)
			}),
			m2 = TestModel.create({
				id: 2,
				name: 'John',
				updatedDate: new Date(2015,1,1)
			}),
			m3 = TestModel.create({
				id: 3,
				name: 'Jack',
				updatedDate: new Date(2016,1,1)
			}),
			m4 = TestModel.create({
				id: 4,
				name: 'Jane',
				updatedDate: new Date(2016,1,1)
			});

		//init some cache
		repo._remote.save([m1,m2,m3,m4]);

	}));

	it('Can Create a repository',function(){
		expect(repo).toBeDefined();
		expect(repo._local.$cache).toEqual({});

	});

	/*
	.initConfig
	 */
	it('initConfig loads the cached configuration, if fresh sets _isFresh to true',function(done){
		inject(function($rootScope){
			repo._initConfig().then(function(){
				expect(repo._configLoaded).toBe(true);
				expect(repo._isFresh).toBe(true);
				expect(repo._updatedAt).toBe(null);
				done();
			});
			
			$rootScope.$digest();
		});
	});
	it('initConfig can load a cached date',function(done){
	    inject(function($rootScope){
			var date = new Date(2016,2,2);
			
	   		repo._local.updatedAt(date).then(function(){
				return repo._initConfig();
			}).then(function(){
				expect(repo._isFresh).toBe(false);
				expect(repo._updatedAt).toBe(date);
				done();
			});
	        $rootScope.$digest();
	    });
	});
	
	/*
	.ready
	 */
	it('Ready is a promise that resolves when ready', function(done){
		inject(function($rootScope){
			repo.ready().then(function(){
				expect(repo._configLoaded).toBe(true);
				done();
			});

			repo._initConfig();
			$rootScope.$digest();
		});
	});
	
	/*
	._pushToLocal
	 */
	/*xit('_pushToLocal can add data onto the local repository',function(done){
	    inject(function($rootScope){
	 var m =

	 $rootScope.$digest();
	    });
	 });*/
	

	/*
	.fetch - from null stage
	 */
	it('fetch can fetch data from the remote store and save into the local store from an empty state',function(done){
	    inject(function($rootScope){
			done();
			repo.fetch().then(function(){
			
			});
			
			
	        $rootScope.$digest();
	    });
	});

	/*
	date comparison
	 */

	/*
	.fetch - differential
	 */

	/*
	.get - basic
	 */

	/*
	.find - basic
	 */

	/*
	.save - part 1
	 */
});