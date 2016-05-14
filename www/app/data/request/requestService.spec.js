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

		RequestService.$disableBackgroundQueueProcessing = true;

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
	it('.goOnline can schedule a retry if fails', function (done) {
		RequestService.$adapter._setOnline(false);

		spyOn(RequestService, 'pingOnline').and.callThrough();
		spyOn(RequestService, 'scheduleRetryGoOnline'); 

		//try to go online
		RequestService.goOnline(true).then(function () {
			//should have pinged Once
			expect(RequestService.pingOnline.calls.count()).toBe(1);
			return $q.when();
		}).then(function () {
		}, function () {
			expect(RequestService.scheduleRetryGoOnline).toHaveBeenCalled();
			done();
		});
		_d();
	});

	/* Go Online should only allow one concurrent going online attempt
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

	//.stayOffline
	it('.stayOffline sets $stayOffline to be true', function () {
		RequestService.stayOffline();
		expect(RequestService.$stayOffline).toBe(true);
	});

	//goBackOnline
	it('.goBackOnline will set $stayOffline to false and call goOnline', function (done) {
		spyOn(RequestService, 'goOnline').and.callThrough();

		RequestService.stayOffline();
		RequestService.goBackOnline().then(function () {
			expect(RequestService.goOnline).toHaveBeenCalled();
			done();
		});
		_d();
	});


	//.scheduleRetryGoOnline
	it('.scheduleRetryGoOnline can increment the retry counter and set retryScheduled to false', function (done) {
		RequestService.$adapter._setOnline(false);

		spyOn(RequestService, 'goOnline').and.callThrough();

		expect(RequestService.scheduleRetryGoOnline()).toBe(true);

		//set retryCount / flag and promise
		expect(RequestService.$retryCount).toBe(1);
		expect(RequestService.$retryScheduled).toBe(true);
		expect(RequestService.$retryPromise).not.toBe(null);

		//use setTimeout to execute code after digest cycle finishes
		setTimeout(function () {
			$timeout.flush();
			expect(RequestService.goOnline.calls.count()).toBe(1);
			done();
		}, 0);

		_d();
	});
	it('.scheduleRetryGoOnline will not schedule and will set stayOffline to false if at retry limit', function () {
		RequestService.$adapter._setOnline(false);
		RequestService.$retryCount = 10;

		expect(RequestService.scheduleRetryGoOnline()).toBe(false);

		expect(RequestService.$retryCount).toBe(0);
		expect(RequestService.$retryScheduled).toBe(false);
		expect(RequestService.$retryPromise).toBe(null);
	});

	/*
	 * Functional Testing of goOnline functionality
	 *
	 * We'll goOffline and try to go online 3 times until hit limit, then should be offline
	 *
	 * We'll then goOnline and try again and all the data should be reset
	 *
	 */
	it('.goOnline functional testing', function (done) {

		/*
		 * We need to do a bit of promise trickery to get the code to run in a testing manner
		 *
		 * We schedule a timeout flush after the current digest cycle
		 * Once this is done, we resolve the promise that then next bit of code is
		 * depending on
		 * We then trigger a digest cycle to force the next block to execute!!
		 */
		var p;

		function flushTimeout() {
			p = $q.defer();
			setTimeout(function () {
				$timeout.flush();
				p.resolve();
				_d();
			}, 0);
		}

		var RS = RequestService; //shorthand

		RS.$adapter._setOnline(false);
		RS.$RETRY_LIMIT = 2;

		RS.goOnline(true, 100, true, false).then(function () {
			//attempt 1
			expect(RS.$retryScheduled).toBe(true);
			expect(RS.$stayOffline).toBe(false);
			flushTimeout();
			return p.promise;
		}).then(function () {
			//attempt 2
			expect(RS.$retryScheduled).toBe(true);
			expect(RS.$stayOffline).toBe(false);
			flushTimeout();
			return p.promise;
		}).then(function () {
			//attempt 3 - should have failed
			expect(RS.$retryScheduled).toBe(false);
			expect(RS.$retryCount).toBe(0);
			expect(RS.$stayOffline).toBe(true);

			//now go back online
			RS.$adapter._setOnline(true);
			return RS.goBackOnline();
		}).then(function () {
			//should now be online
			expect(RS.$stayOffline).toBe(false);
			expect(RS.$isOnline).toBe(true);
			done();
		}, function (error) {

			//error handling
			expect(error).toBeUndefined();
			expect(false).toBe(true);
			done();
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

	//findChunks
	it('.findChunked can download all paginated data', function (done) {
		//pre-populate data
		RequestService.$adapter.$cache['test'] = [
			{name: 'A'},
			{name: 'B'},
			{name: 'C'},
			{name: 'D'},
			{name: 'E'},
			{name: 'F'},
			{name: 'G'},
			{name: 'H'},
			{name: 'I'},
			{name: 'J'}
		];

		RequestService.findChunked(TestModel, {limit: 3}).then(function (data) {
			expect(data.length).toBe(10);
			//preserve order
			expect(data[0].name).toBe('A');
			expect(data[5].name).toBe('F');
			expect(data[9].name).toBe('J');
			done();
		});

		_d();
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


	/*
	 *
	 * Error Intercepting
	 *
	 */
	it('.interceptor registers an error interceptor that is called by _handleError', function () {
		var flag = false;
		RequestService.interceptor(function () {
			flag = true;
		});

		RequestService._handleError();

		expect(flag).toBe(true);
	});

});