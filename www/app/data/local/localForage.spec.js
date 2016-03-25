describe('saferota.data LocalAdpatorLocalForage', function () {
	beforeEach(module('saferota.data'));

	afterEach(inject(function (LocalAdaptorLocalForage) {
		LocalAdaptorLocalForage.clearAll();
	}));

	/*
	 Can create / store / get parameters
	 */
	it('Can create new cache and save data into it', function (done) {
		inject(function (LocalAdaptorLocalForage, $rootScope) {
			var local = new LocalAdaptorLocalForage('test');

			local.setData('name', 'John').then(function () {
				return local.getData('name');
			}).then(function (data) {
				expect(data).toEqual('John');
				done();

			});
			setTimeout(function(){
				$rootScope.$digest();
			},400);
			setTimeout(function(){
				$rootScope.$digest();
			},800);

		});
	});
});