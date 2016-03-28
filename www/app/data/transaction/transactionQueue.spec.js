describe('saferota.data TransactionQueue', function () {
	beforeEach(module('saferota.data'));

	var TransactionQueue, Transaction, TestModel, queue, $rootScope;
	
	function _d(){
		$rootScope.$digest();
	}

	//Setup Objects
	beforeEach(inject(function (_TransactionQueue_, _Transaction_, Model, _$rootScope_) {
		TransactionQueue = _TransactionQueue_;
		Transaction = _Transaction_;
		$rootScope = _$rootScope_;
		TestModel = new Model('test').schema({firstName: 'John', lastName: 'Doe'});

		queue = new TransactionQueue('LocalAdapterMemory');
	}));

	//Clear After
	afterEach(function (done) {
		queue.clear().then(function () {
			done();
		});
		_d();
	});


	it('Can create a local adapter', function(){
		expect(queue.$cache).not.toBeNull();
	});


});