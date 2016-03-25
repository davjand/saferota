describe('saferota.core dataService', function () {
	beforeEach(module('saferota.core'));

	it('Can Wrap a backendless object to use promises',
		function (done) {
			inject(function (dataService, Backendless, $q, $rootScope) {

				var p = 888;
				var returnValue = 777;

				//function callback
				var obj = {};
				obj.fx = function (param, async) {
					//can pass a param
					expect(param).toEqual(p);
					//return a value
					async.success(returnValue);
				};

				//function should resolve
				dataService._w(obj, 'fx', p).then(function (data) {
					expect(data).toEqual(returnValue);

					done();
				});

				$rootScope.$digest();
			});
		});
});