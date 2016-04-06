describe('saferota.data Repository', function () {
	beforeEach(module('saferota.data'));

	var repo, ModelService, TestModel, $rootScope, RequestService, RepositoryService;
	var m1, m2, m3, m4;


	beforeEach(inject(function (_ModelService_, _$rootScope_, _RequestService_, _RepositoryService_) {
		ModelService = _ModelService_;
		$rootScope = _$rootScope_;
		RequestService = _RequestService_;
		RepositoryService = _RepositoryService_;

		TestModel = ModelService.create('TestModel').schema({name: 'default'});
		repo = RepositoryService.create(TestModel);

		m1 = TestModel.create({
			id: 1,
			name: 'James',
			updatedDate: new Date(2015, 1, 1)
		});
		m2 = TestModel.create({
			id: 2,
			name: 'John',
			updatedDate: new Date(2015, 1, 1)
		});
		m3 = TestModel.create({
			id: 3,
			name: 'Jack',
			updatedDate: new Date(2016, 1, 1)
		});
		m4 = TestModel.create({
			id: 4,
			name: 'Jane',
			updatedDate: new Date(2016, 1, 1)
		});


	}));

	afterEach(function () {
		ModelService.clear();
	});

	it('Can Create a repository', function () {
		expect(repo).toBeDefined();
		expect(repo.$local.$cache).toEqual({});

	});

	/*
	 .initConfig
	 */
	it('initConfig loads the cached configuration, if fresh sets _isFresh to true', function (done) {
		inject(function ($rootScope) {
			repo._initConfig().then(function () {
				expect(repo._configLoaded).toBe(true);
				expect(repo._isFresh).toBe(true);
				expect(repo._updatedAt).toBe(null);
				done();
			});

			$rootScope.$digest();
		});
	});
	it('initConfig can load a cached date', function (done) {
		inject(function ($rootScope) {
			var date = new Date(2016, 2, 2);

			repo.$local.updatedAt(date).then(function () {
				return repo._initConfig();
			}).then(function () {
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
	it('Ready is a promise that resolves when ready', function (done) {
		inject(function ($rootScope) {
			repo.ready().then(function () {
				expect(repo._configLoaded).toBe(true);
				done();
			});

			repo._initConfig();
			$rootScope.$digest();
		});
	});

	/*


	 Internal memory functions


	 */
	it('initializes a $mem cache when created', function () {
		expect(repo.$mem).toEqual({});
	});
	/*
	 _putMem
	 */
	it('_putMem can add a model to memory', function () {

		repo._putMem(m1); //already done by default
		var a = repo.$mem[m1.id];
		expect(a.m).toBe(m1);
		expect(a.c).toBe(1);
		expect(a.s[0]).toBe($rootScope);

		//if try to do again, should do nothing as same scope
		repo._putMem(m1);
		var b = repo.$mem[m1.id];
		expect(b.c).toEqual(1);
		expect(b.s.length).toEqual(1);

		//if try to do with a different scope, should increment
		var $s = $rootScope.$new(true);

		repo._putMem(m1, $s);
		var c = repo.$mem[m1.id];
		expect(c.c).toBe(2);
		expect(c.s[1]).toBe($s);

		//can add a seperate item
		repo._putMem(m2);
		expect(Object.keys(repo.$mem).length).toBe(2);

	});
	/*
	 _inMem
	 */
	it('_inMem returns true or false if the model / id is in memory', function () {
		repo._putMem(m1);
		expect(repo._inMem(m1)).toBe(true);
		expect(repo._inMem(m1.id)).toBe(true); //can accept string
	});
	/*
	 _regScope callback
	 */
	it('_regScope should create a callback for when being destroyed', function () {

		var $scope = $rootScope.$new(true);
		repo._putMem(m1, $scope);

		spyOn(repo, '_deregScope');
		$scope.$destroy();
		expect(repo._deregScope).toHaveBeenCalled();
	});
	/*
	 _deregScope
	 */
	it('_deregScope should remove the scope watcher and remove the item from memory if no more scopes attached', function () {

		var $scope = $rootScope.$new(true);
		repo._putMem(m1, $scope);
		$scope.$destroy();

		//should be destroyed
		expect(Object.keys(repo.$mem).length).toEqual(0);

		//if two scopes then should still be there but decremented count
		var $scope2 = $rootScope.$new(true);

		repo._putMem(m1);
		repo._putMem(m1, $scope2);

		$scope2.$destroy();

		var a = repo.$mem[m1.id];
		expect(a.c).toBe(1);
		expect(a.s.length).toBe(1);
		expect(a.s[0]).toBe($rootScope);

	});


	/*
	 save
	 */
	it('save can save a model into the repository, if not registered, will register them', function (done) {
		var $s = $rootScope.$new(true);

		//save
		repo.save(m1, $s).then(function () {
			expect(repo._inMem(m1.id)).toBe(true); //should be in memory

			return repo.$local.data(m1.id); //should be stored
		}).then(function (object) {
			//should be stored
			expect(object.name).toBe(m1.name);
			done();
		});

		$rootScope.$digest();
	});

	it('.save can take an array', function (done) {
		repo.save([m1, m2, m3]).then(function () {
			expect(Object.keys(repo.$mem).length).toBe(3);

			return repo.$local.length();
		}).then(function (len) {
			expect(len).toBe(3);

			done();
		});
		$rootScope.$digest();

	});


	/*
	 get
	 */
	it('.get can retrieve a model from memory if is in memory', function (done) {
		spyOn(repo.$local, 'get').and.callThrough();

		repo.save([m1, m2, m3]).then(function () {
			return repo.get(m1.id)
		}).then(function (model1) {
			//shouldn't have gone to the local adapter
			expect(repo.$local.get).not.toHaveBeenCalled();
			//shouldn't have been recreated, should be existing object
			expect(model1).toBe(m1);
			done();
		});

		$rootScope.$digest();
	});
	it('.get can retrieve a model from the cache if forced (and update local object)', function (done) {
		spyOn(repo.$local, 'get').and.callThrough();

		repo.save([m1, m2]).then(function () {

			//do some hacking to make sure updates
			repo.$local.$cache[m2.id].name = "New Name";

			return repo.get(m2.id, true);
		}).then(function (model2) {
			//should have gone to the local adapter
			expect(repo.$local.get).toHaveBeenCalled();

			//should have updated the object
			expect(model2).toBe(m2);
			expect(model2.name).toEqual("New Name");
			done();
		});


		$rootScope.$digest();
	});
	it('.get can retrieve a model from the cache if it does not exist in memory', function (done) {
		var $s = $rootScope.$new(true);

		repo.save(m1, $s).then(function () {
			$s.$destroy(); //should destroy the in memory copy
			expect(repo._inMem(m1)).toBe(false);

			return repo.get(m1.id);
		}).then(function (newModel) {
			expect(repo._inMem(m1)).toBe(true);
			expect(newModel.name).toBe(m1.name);
			done();
		});


		$rootScope.$digest();
	});


	/*
	 find
	 */

	/*
	 notify
	 */

	/*
	 clear
	 */
	it('.clear', function () {
		var $s = $rootScope.$new(true);
		repo.save(m1, $s);
		repo.clear();
		expect(repo._inMem(m1.id)).toBe(false);

	});

});