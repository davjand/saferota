describe('saferota.data RequestService', function () {
	beforeEach(module('saferota.data'));

	var RequestService, ModelService, RepositoryService, $rootScope, $timeout, TestModel, $q, repo,
		m1, m2;

	beforeEach(inject(function (_RequestService_, _ModelService_, _$rootScope_, _$q_, _RepositoryService_, _$timeout_) {
		RequestService = _RequestService_;
		ModelService = _ModelService_;
		$rootScope = _$rootScope_;
		RepositoryService = _RepositoryService_;
		$q = _$q_;
		$timeout = _$timeout_;

		TestModel = ModelService.create('test').schema({name: 'no name'});
		repo = RepositoryService.create(TestModel);
		m1 = TestModel.create({name: 'james'});
		m2 = TestModel.create({name: 'john'});

	}));

	afterEach(function () {
		ModelService.clear();
		RepositoryService.clear();
	});

	/*

	 Helper Functions

	 */
	function _d() {
		$rootScope.$digest();
	}

	/*
	 .init
	 */
	it('Can create a new object', function () {
		expect(RequestService.$queue).not.toBeUndefined();
		expect(RequestService.$adapter).not.toBeUndefined();
	});
	it('isOnline is false when created', function () {
		expect(RequestService.$isOnline).toBe(false);
	});

	/*
	 .pingOnline
	 */
	it('.pingOnline returns a promise which resolves to true if online', function (done) {
		RequestService.$adapter._setOnline(true);
		RequestService.pingOnline().then(function (online) {
			expect(RequestService.$isOnline).toBe(true);

			expect(online).toBe(true);
			done();
		});

		_d();
	});
	it('.pingOnline emits an event if was online and now offline', function (done) {
		var called = 0, $s = $rootScope.$new();
		RequestService.on($s, 'goOnline', function () {
			called++;
		});

		RequestService.pingOnline().then(function () {
			//should have been called
			expect(called).toBe(1);
			return RequestService.pingOnline();
		}).then(function () {
			//should not have been called again
			expect(called).toBe(1);
			$s.$destroy();
			done();
		});
		_d();
	});

	/*
	 * Go Online should only allow one concurrent going online attempt
	 * It should store one central promise that resolves for all attempts
	 */
	it('.goOnline only allows a single request at the same time, instead it returns a promise', function (done) {
		var p = $q.defer();
		spyOn(RequestService, 'pingOnline').and.returnValue(p.promise);
		var called = false;

		RequestService.goOnline().then(function () {
			called = true;
		});
		RequestService.goOnline().then(function () {
			expect(RequestService.pingOnline.calls.count()).toBe(1);
			expect(called).toBe(true);
			expect(RequestService.$goingOnline).toBe(false);
			done();
		}, function (error) {
			//error handling
			expect(error).toBeUndefined();
			expect(false).toBe(true);
			done();
		});

		expect(RequestService.$goingOnline).toBe(true);
		p.resolve(true);
		_d();
	});



	it('.pingOnline returns a promise which resolves to false if not online', function (done) {
		RequestService.$adapter._setOnline(false);
		RequestService.pingOnline().then(function (online) {
			expect(RequestService.$isOnline).toBe(false);
			expect(online).toBe(false);
			done();
		});
		_d();
	});


	it('.pingOnline can reject the promise if passed true and offline', function (done) {
		RequestService.$adapter._setOnline(false);

		RequestService.pingOnline(true).then(function () {
			expect(false).toBe(true);
		}, function () {
			expect(true).toBe(true);
			expect(RequestService.$isOnline).toBe(false);
			done();
		});
		_d();
	});
	it('.pingOnline emits an event if was offline and now online', function (done) {
		RequestService.$adapter._setOnline(false);

		var called = 0, $s = $rootScope.$new();
		RequestService.on($s, 'goOffline', function () {
			called++;
		});

		RequestService.pingOnline().then(function () {
			//should have been called
			expect(called).toBe(0);
			RequestService.$isOnline = true; //simulate a goOffline event
			return RequestService.pingOnline();
		}).then(function () {
			//should not have been called again
			expect(called).toBe(1);
			$s.$destroy();
			done();
		});
		_d();
	});

	/*
	 .goOnline
	 */
	it('.goOnline resolves a promise if already online', function (done) {
		RequestService.$isOnline = true;
		RequestService.goOnline().then(function () {
			expect(true).toBe(true);
			done();
		});
		_d();
	});
	it('a goOnline event causes the request queue to be executed', function (done) {
		spyOn(RequestService, 'next');

		RequestService.goOnline().then(function () {
			expect(RequestService.next).toHaveBeenCalled();
			done();
		});
		_d();
	});

	it('goOnline can schedule a retry if fails', function (done) {
		RequestService.$adapter._setOnline(false);

		spyOn(RequestService, 'pingOnline').and.callThrough();

		//try to go online
		RequestService.goOnline(true).then(function () {
			//should have pinged Once
			expect(RequestService.pingOnline.calls.count()).toBe(1);
			return $q.when();
		}).then(function () {
		}, function () {

			/*
			 use setTimeout to execute code after digest cycle finishes
			 */
			setTimeout(function () {
				$timeout.flush();
				expect(RequestService.pingOnline.calls.count()).toBe(2);
				done();
			}, 0);
		});
		_d();
	});


	/*
	 .create
	 */
	it('.create is a shortcut for create request', function () {
		spyOn(RequestService, 'createRequest').and.returnValue($q.when());
		RequestService.create(m1, false);

		expect(RequestService.createRequest).toHaveBeenCalledWith(m1, RequestService.TYPES.CREATE, false);
	});

	/*
	 .update
	 */
	it('.update is a shortcut for update request', function () {
		spyOn(RequestService, 'createRequest').and.returnValue($q.when());
		RequestService.update(m1, false);
		expect(RequestService.createRequest).toHaveBeenCalledWith(m1, RequestService.TYPES.UPDATE, false);
	});

	/*
	 .remove
	 */
	it('.remove is a shortcut for remove request', function () {
		spyOn(RequestService, 'createRequest').and.returnValue($q.when());
		RequestService.remove(m1, false);
		expect(RequestService.createRequest).toHaveBeenCalledWith(m1, RequestService.TYPES.DELETE, false);
	});

	/*
	 .createRequest
	 */
	it('.createRequest pushes an item onto the queue', function (done) {

		RequestService.createRequest(m1, RequestService.TYPES.CREATE, false).then(function () {
			return RequestService.$queue.getNext();
		}).then(function (item) {
			expect(item.model.id).toBe(m1.id);
			done();
		});

		$rootScope.$digest();
	});

	/*
	 .find
	 */
	it('find calls find on the adapter', function (done) {
		spyOn(RequestService.$adapter, 'find');
		var options = {filter: {name: 'james'}};

		RequestService.find(TestModel, options).then(function () {
			expect(RequestService.$adapter.find).toHaveBeenCalledWith(TestModel, options);
			done();
		});
		$rootScope.$digest();
	});


	/*
	 .get
	 */
	it('get calls get on the adapter', function (done) {
		spyOn(RequestService.$adapter, 'get');

		RequestService.get(TestModel, 2).then(function () {
			expect(RequestService.$adapter.get).toHaveBeenCalledWith(TestModel, 2);
			done();
		});
		$rootScope.$digest();
	});


	/*
	 .next
	 */
	it('.next executes the next request, sets active and calls the callback function', function (done) {
		spyOn(RequestService, '_handleResponse');
		spyOn(RequestService.$adapter, 'save').and.callThrough();

		RequestService.create(m1, false).then(function () {
			return RequestService.next();
		}).then(function () {
			expect(RequestService.$inProgress).toBe(true);
			expect(RequestService.$adapter.save).toHaveBeenCalled();
			expect(RequestService._handleResponse).toHaveBeenCalled();

			done();
		}, function (error) {
			expect(error).toBeUndefined();
			expect(false).toBe(true);
			done();
		});

		$rootScope.$digest();
	});

	it('Nothing happens when next is called if there are no items on the queue', function (done) {
		RequestService.next().then(function () {
			done();
		});
		$rootScope.$digest();
	});

	/*
	 Execute straight away
	 */
	it('.next can execute all requests and return a promise to all events being completed', function (done) {

		RequestService.create(m1, false).then(function () {
			return RequestService.create(m2);
		}).then(function () {
			return RequestService.next(true);
		}).then(function () {
			return RequestService.$queue.length();
		}).then(function (len) {
			expect(len).toBe(0);
			done();
		});
		$rootScope.$digest();
	});


	/*
	 ._handleResponse
	 */
	it('._handleResponse should be called with the response, set processing to false and resolve the transaction', function (done) {
		spyOn(RequestService, '_handleResponse').and.callThrough();
		spyOn(RequestService.$queue, 'resolveTransaction').and.callThrough();

		RequestService.create(m1, false).then(function () {
			return RequestService.next();
		}).then(function () {
			expect(RequestService.$processing).toBe(false);
			expect(RequestService._handleResponse).toHaveBeenCalled();
			expect(RequestService.$queue.resolveTransaction).toHaveBeenCalled();

			//queue should now be empty
			return RequestService.$queue.length();
		}).then(function (l) {
			expect(l).toBe(0);
			done();
		});

		$rootScope.$digest();
	});


	/*
	 ._handleError
	 */
	it('._handleError should be called when there is an error reject the promise with the error code and set inprogress to false', function (done) {
		spyOn(RequestService, '_handleError').and.callThrough();
		//simulate a fail
		spyOn(RequestService.$adapter, 'save').and.callFake(function () {
			var p = $q.defer();
			p.reject({error: 'error'});
			return p.promise;
		});
		RequestService.create(m1).then(function () {
			return RequestService.next();
		}).then(function () {
			expect(true).toBe(false);//should never get called as should reject
			done();
		}, function () {
			expect(RequestService._handleError).toHaveBeenCalled();
			expect(RequestService.$inProgress).toBe(false);

			done();
		});
		$rootScope.$digest();
	});
});