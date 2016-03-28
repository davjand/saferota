describe('saferota.data RepositoryService', function () {
	beforeEach(module('saferota.data'));
	
	var TestModel = null;
	
	beforeEach(inject(function(ModelService){
		TestModel = ModelService.create('test');
	}));
	
	it('Can intiialize', inject(function (RepositoryService) {
		expect(RepositoryService.$cache).toEqual({});
	}));

	it('Can create and cache models with the model factory', inject(function (RepositoryService) {
		var Repo = RepositoryService.create(TestModel);
		expect(RepositoryService.$cache['test']).toEqual(Repo);
	}));

	it('Can return a a repo by string or by Model', inject(function (RepositoryService) {
		var Repo = RepositoryService.create(TestModel);
		expect(RepositoryService.get(TestModel)).toEqual(Repo);
		expect(RepositoryService.get('test')).toEqual(Repo);
	}));


});