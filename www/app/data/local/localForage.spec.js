describe('saferota.data LocalAdpatorLocalForage', function () {
	beforeEach(module('saferota.data'));

	afterEach(inject(function (LocalAdapterLocalForage) {
		LocalAdapterLocalForage.clearAll();
	}));

	/*
	 Can create / store / get parameters
	 */
	it('Can create new cache and save data into it', function (done) {
		inject(function (LocalAdapterLocalForage, $rootScope) {
			var local = new LocalAdapterLocalForage({name:'test'});

			local.set('name', 'John').then(function () {
				return local.get('name');
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