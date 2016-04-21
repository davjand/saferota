describe('saferota.data ModelService', function () {
	var ModelService;

	beforeEach(module('saferota.data'));
	beforeEach(inject(function (_ModelService_) {
		ModelService = _ModelService_;
	}));

	afterEach(function () {
		ModelService.clear();
	});


	it('Can intiialize', function () {
		expect(ModelService.$cache).toEqual({});
	});

	/*
	 .create
	 */
	it('Can create and cache models with the model factory', function () {
		var Test = ModelService.create('test');
		expect(ModelService.$cache['test']).toEqual(Test);
	});

	/*
	 .get
	 */
	it('Can return a previously created model', function () {
		var Test = ModelService.create('test');
		expect(ModelService.get('test')).toEqual(Test);
	});

	/*
	 .isLocalId
	 */
	it('.isLocalId takes a local id and returns true if the model is local', function () {
		var TestModel = ModelService.create('test').schema({name: ''});

		var t1 = TestModel.create({id: 1, name: 'James'}),
			t2 = TestModel.create({name: 'Local'});

		expect(ModelService.isLocalId(t1.id)).toBe(false);
		expect(ModelService.isLocalId(t2.id)).toBe(true);
	});

});