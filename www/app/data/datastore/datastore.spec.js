describe('saferota.data DataStore', function () {
	beforeEach(module('saferota.data'));

	var DataStore, RepositoryService, ModelService;

	beforeEach(inject(function (_DataStore_, _RepositoryService_, _ModelService_) {
		DataStore = _DataStore_;
		RepositoryService = _RepositoryService_;
		ModelService = _ModelService_;

	}));

	afterEach(function () {
		RepositoryService.clear();
		ModelService.clear();
	});

	it('.create can create a model definition, repository and setup a callback', function () {
		var TestModel = DataStore.create('test').schema({name: 'david'});

		expect(ModelService.get('test')).not.toBeUndefined();
		expect(RepositoryService.get(TestModel)).not.toBeUndefined();

	});
	it('.create sets up a callback so whenever a model is created, it is cached in the repo', function () {
		var TestModel = DataStore.create('test').schema({name: 'david'});
		var m1 = TestModel.create({name: 'james'});

		expect(RepositoryService.get(TestModel)._getMem(m1.id).name).toBe('james');
	});
});