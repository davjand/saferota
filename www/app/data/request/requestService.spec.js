describe('saferota.data RequestService', function () {
	beforeEach(module('saferota.data'));

	var RequestService, ModelService, RepositoryService, $rootScope, TestModel, $q, repo,
		m1, m2, m3;

	beforeEach(inject(function (_RequestService_, _ModelService_, _$rootScope_, _$q_, _RepositoryService_) {
		RequestService = _RequestService_;
		ModelService = _ModelService_;
		$rootScope = _$rootScope_;
		RepositoryService = _RepositoryService_;
		$q = _$q_;

		TestModel = ModelService.create('test').schema({name: 'no name'});
		repo = RepositoryService.create(TestModel);
		m1 = TestModel.create({name: 'james'});

	}));

	afterEach(function () {
		ModelService.clear();
		RepositoryService.clear();
	});

	it('Can create a new object', function () {
		expect(RequestService.$queue).not.toBeUndefined();
		expect(RequestService.$adapter).not.toBeUndefined();
	});

	/*
	 .create
	 */
	it('.create is a shortcut for create request', function () {
		spyOn(RequestService, 'createRequest').and.returnValue($q.when());
		RequestService.create(m1);

		expect(RequestService.createRequest).toHaveBeenCalledWith(m1, RequestService.TYPES.CREATE);
	});

	/*
	 .update
	 */
	it('.update is a shortcut for update request', function () {
		spyOn(RequestService, 'createRequest').and.returnValue($q.when());
		RequestService.update(m1);
		expect(RequestService.createRequest).toHaveBeenCalledWith(m1, RequestService.TYPES.UPDATE);
	});

	/*
	 .remove
	 */
	it('.remove is a shortcut for remove request', function () {
		spyOn(RequestService, 'createRequest').and.returnValue($q.when());
		RequestService.remove(m1);
		expect(RequestService.createRequest).toHaveBeenCalledWith(m1, RequestService.TYPES.DELETE);
	});

	/*
	 .createRequest
	 */
	it('.createRequest pushes an item onto the queue', function (done) {

		RequestService.createRequest(m1, RequestService.TYPES.CREATE).then(function () {
			return RequestService.$queue.getNext();
		}).then(function (item) {
			expect(item.model.id).toBe(m1.id);
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

		RequestService.create(m1).then(function () {
			return RequestService.next();
		}).then(function () {
			expect(RequestService.inProgress).toBe(true);
			expect(RequestService.$adapter.save).toHaveBeenCalled();
			expect(RequestService._handleResponse).toHaveBeenCalled();

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
	 ._handleResponse
	 */
	it('._handleResponse should be called with the response, set inProgress to false and resolve the transaction', function (done) {
		spyOn(RequestService, '_handleResponse').and.callThrough();
		spyOn(RequestService.$queue, 'resolveTransaction').and.callThrough();

		RequestService.create(m1).then(function () {
			return RequestService.next();
		}).then(function () {
			expect(RequestService.inProgress).toBe(false);
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
			expect(RequestService.inProgress).toBe(false);

			done();
		});
		$rootScope.$digest();
	});
});