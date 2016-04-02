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
	 .clear
	 */
	it('Can clear', function () {
		ModelService.create("test");
		ModelService.clear();
		expect(ModelService.$cache.length).toBe(0);
	});


});