describe('saferota.data ModelService', function () {
	beforeEach(module('saferota.data'));

	it('Can intiialize', inject(function (ModelService) {
		expect(ModelService.$cache).toEqual({});
	}));

	it('Can create and cache models with the model factory', inject(function (ModelService) {
		var Test = ModelService.create('test');
		expect(ModelService.$cache['test']).toEqual(Test);
	}));

	it('Can return a previously created model', inject(function (ModelService) {
		var Test = ModelService.create('test');
		expect(ModelService.get('test')).toEqual(Test);
	}));


});