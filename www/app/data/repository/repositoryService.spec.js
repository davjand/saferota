describe('saferota.data RepositoryService', function () {
	beforeEach(module('saferota.data'));

	var RepositoryService, ModelService, TestModel, repo;

	beforeEach(inject(function (_RepositoryService_, _ModelService_) {
		RepositoryService = _RepositoryService_;
		ModelService = _ModelService_;

		TestModel = ModelService.create('test');
	}));

	afterEach(function () {
		RepositoryService.clear();
	});

	it('Can intiialize', function () {
		expect(RepositoryService.$cache).toEqual({});
	});

	/*
	 .create
	 */
	it('Can create and cache models with the model factory', function () {
		var Repo = RepositoryService.create(TestModel);
		expect(RepositoryService.$cache['test']).toEqual(Repo);
	});

	/*
	 .getRepo
	 */
	it('Can return a a repo by string or by Model', function () {
		var Repo = RepositoryService.create(TestModel);
		expect(RepositoryService.get(TestModel)).toEqual(Repo);
		expect(RepositoryService.get('test')).toEqual(Repo);
	});

	/*
	 .clear
	 */
	it('Can clear', function () {
		RepositoryService.create(TestModel);
		RepositoryService.clear();
		expect(RepositoryService.$cache.length).toBe(0);
	});

	/*
	 .notify
	 */
	it('Can notify a repository', function () {

	});


});