describe('saferota.data TransactionQueue', function () {
	beforeEach(module('saferota.data'));

	var TransactionQueue, Transaction, RepositoryService, TestModel, ModelService, queue, $rootScope,
		m1, m2, m3, t1, t2, t3, t4, t5, t6;


	function _d() {
		$rootScope.$digest();
	}

	//Setup Objects
	beforeEach(inject(function (_TransactionQueue_,
								_Transaction_,
								_RepositoryService_,
								_ModelService_,
								_$rootScope_) {

		TransactionQueue = _TransactionQueue_;
		Transaction = _Transaction_;
		$rootScope = _$rootScope_;
		RepositoryService = _RepositoryService_;
		ModelService = _ModelService_;

		
		TestModel = ModelService.create('test').schema({firstName: 'John', lastName: 'Doe'});

		queue = new TransactionQueue('LocalAdapterMemory');

		//create objects
		m1 = TestModel.create();
		m2 = TestModel.create({id: 20, firstName: 'David', lastName: 'Bowie'});
		m3 = TestModel.create({firstName: 'Jane', lastName: 'Doe'});

		t1 = new Transaction(Transaction.TYPES.CREATE, m1);
		t2 = new Transaction(Transaction.TYPES.UPDATE, m1);
		t3 = new Transaction(Transaction.TYPES.DELETE, m1);

		t4 = new Transaction(Transaction.TYPES.UPDATE, m2);

		t5 = new Transaction(Transaction.TYPES.CREATE, m3);
		t6 = new Transaction(Transaction.TYPES.UPDATE, m3);

	}));

	//Clear After
	afterEach(function () {
		queue.clear();
		ModelService.clear();
	});


	/*
	 constructor
	 */
	it('Can create a local adapter', function () {
		expect(queue.$cache).not.toBeNull();
	});

	/*
	 .push
	 */
	it('.push can add onto an array', function (done) {

		queue.push(t1).then(function () {
			return queue.length();
		}).then(function (len) {
			expect(len).toBe(1);
			return queue.push(t2)
		}).then(function () {
			return queue.length();
		}).then(function (len) {
			expect(len).toBe(2);
			done();
		});
		_d();
	});

	/*
	 .pushArray
	 */
	it('.pushArray can add onto an array', function (done) {

		queue.pushArray([t1, t2, t4]).then(function () {
			return queue.length();
		}).then(function (len) {
			expect(len).toBe(3);
			done();
		});
		_d();
	});

	/*
	 /getNext
	 */
	it('.getNext returns the top item in the queue', function (done) {
		queue.pushArray([t1, t2]).then(function () {
			return queue.getNext();
		}).then(function (transaction) {
			expect(transaction.type).toBe(t1.type);
			expect(transaction.model.firstName).toBe(t1.model.firstName);
			expect(transaction.toObject).toBeDefined();
			done();
		});
		_d();
	});
	it('.getNext should return null if no items remainined', function (done) {
		queue.getNext().then(function (data) {
			expect(data).toBeNull();
			done();
		});
		_d();
	});

	/*
	 .pop
	 */
	it('.pop can remove items from the array', function (done) {
		queue.pushArray([t1, t2, t3]).then(function () {
			return queue.pop();
		}).then(function (transaction) {
			expect(transaction.type).toBe(t1.type);
			expect(transaction.toObject).toBeDefined();
			expect(transaction.model.firstName).toBe(t1.model.firstName);

			return queue.pop();
		}).then(function (transaction) {
			expect(transaction.type).toBe(t2.type);
			expect(transaction.model.firstName).toBe(t2.model.firstName);

			//add another on to test
			return queue.push(t4);
		}).then(function () {
			return queue.pop();
		}).then(function (transaction) {
			expect(transaction.type).toBe(t3.type);
			expect(transaction.model.firstName).toBe(t3.model.firstName);

			//check the length
			return queue.length();
		}).then(function (length) {
			expect(length).toBe(1);
			return queue.pop();
		}).then(function (transaction) {
			expect(transaction.type).toBe(t4.type);
			expect(transaction.model.firstName).toBe(t4.model.firstName);
			done();
		});
		_d();
	});


	/*
	 Can build a cache of transaction ids and their location
	 */
	it('._buildLocalIdCache builds an array of local IDS', function (done) {
		queue.pushArray([t1, t2, t3, t4, t5, t6]).then(function () {
			return queue._buildLocalIdCache()
		}).then(function (cache) {

			//should only be 2 items in the cache
			expect(Object.keys(cache).length).toBe(2);

			//shouldn't have any m3 as not local
			expect(cache[m2.id]).not.toBeDefined();

			//should have m1 and m2
			expect(cache[m1.id]).toBeDefined();
			expect(cache[m3.id]).toBeDefined();

			//should have 3 references to m1
			expect(cache[m1.id].length).toBe(3);
			//positions should correspond to transactions
			expect(cache[m1.id][0].position).toBe(0);
			expect(cache[m1.id][1].position).toBe(1);
			expect(cache[m1.id][2].position).toBe(2);
			expect(cache[m1.id][1].type).toBe('P');

			//2 references to m3
			expect(cache[m3.id].length).toBe(2);
			//positions should correspond to transactions
			expect(cache[m3.id][0].position).toBe(4);
			expect(cache[m3.id][1].position).toBe(5);
			expect(cache[m3.id][1].type).toBe('P');

			done();

		});
		_d();
	});

	/*
	 .clear clears the localIDCache
	 */

	/*
	 .push adds local ids to the cache
	 */
	it('.push adds local ids onto the local array', function (done) {
		queue.pushArray([t1, t2, t3, t4, t5, t6]).then(function () {
			//subset of unit tests from above
			var cache = queue.$localId;
			expect(Object.keys(cache).length).toBe(2);
			expect(cache[m1.id][1].position).toBe(1);
			expect(cache[m1.id][2].position).toBe(2);
			expect(cache[m3.id][0].position).toBe(4);
			expect(cache[m3.id][1].position).toBe(5);

			done();
		});

		_d();
	});

	/*
	 .pop removes local ids from the cache
	 */
	it('.pop removes items from the local cache', function (done) {
		queue.pushArray([t1, t2, t3, t4, t5, t6]).then(function () {
			var cache = queue.$localId;
			expect(Object.keys(cache).length).toBe(2);
			expect(cache[m1.id].length).toBe(3);
			expect(cache[m1.id][1].position).toBe(1);
			expect(cache[m1.id][2].position).toBe(2);

			return queue.pop();
		}).then(function () {
			var cache = queue.$localId;
			expect(cache[m1.id].length).toBe(2);
			expect(cache[m1.id][0].position).toBe(1);
			expect(cache[m1.id][1].position).toBe(2);

			//if last transaction, the id should be removed
			return queue.pop().then(function () {
				return queue.pop();
			});
		}).then(function () {
			var cache = queue.$localId;
			expect(cache[m1.id]).not.toBeDefined();
			done();
		});

		_d();
	});

	/*
	 .resolveTransaction

	 Return data for when a transaction is resolved with the server
	 - should notify the relevant repository
	 - should see if any other transactions are reliant on this transaction and update the transactions with the new id
	 - pop the transaction and remove te relevent local id.

	 */
	it('.resolveTransaction can resolve a transaction', function (done) {

		spyOn(RepositoryService, 'notify');

		queue.pushArray([t1, t2, t3, t4]).then(function () {
			return queue.resolveTransaction({id: 17});
		}).then(function () {

			//should have notified the repository
			expect(RepositoryService.notify).toHaveBeenCalled();
			return queue.length();
		}).then(function (len) {
			//should have popped the transaction
			expect(len).toBe(3);

			//the cache should be gone as well
			expect(queue.$localId[m1.id]).not.toBeDefined();

			return queue.getNext();
		}).then(function (nextTx) {
			//The next transaction should now be t2
			expect(nextTx.model.firstName).toBe(m1.firstName);
			//ID should have been updated to the resolved data
			expect(nextTx.model.id).toBe('17');
			expect(nextTx.model.__existsRemotely).toBe(true);


			//resolve the next one with no data
			return queue.resolveTransaction();
		}).then(function () {
			//should have been called twice now
			expect(RepositoryService.notify).toHaveBeenCalledTimes(2);

			return queue.getNext();
		}).then(function (nextTx) {
			//this should be t3 and been resolved (as same model) which should have been resolved from the first resolution
			expect(nextTx.model.id).toBe('17');
			done();
		});

		_d();
	});


});