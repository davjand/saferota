describe('saferota.data Transaction', function () {
	beforeEach(module('saferota.data'));

	var TestModel, ModelService, Transaction;

	beforeEach(inject(function(_ModelService_, _Transaction_){
		ModelService = _ModelService_;
		Transaction = _Transaction_;
		TestModel = ModelService.create('test').schema({name: 'test'});
	}));

	afterEach(function(){
		ModelService.clear();
	});


	/*
	constructor
	 */
	it('Can create a new transaction',function(){
		var m1 = TestModel.create({id: 2, name: 'david'});

		var tx = new Transaction(Transaction.TYPES.CREATE,m1);

		expect(tx.type).toBe(Transaction.TYPES.CREATE);
		expect(tx.time).not.toBeNull();
		expect(tx.modelName).toBe('test');
		expect(tx.model).toBe(m1);
	});

	/*
	toObject
	 */
	it('toObject: Can convert its self into an object ', function () {
		//Local and non-local just to test
		var m1 = TestModel.create({id: 2, name: 'david'});
		var m2 = TestModel.create({name: 'david'});

		var tx1 = new Transaction(Transaction.TYPES.CREATE,m1);
		var tx2 = new Transaction(Transaction.TYPES.UPDATE,m2);

		var d1 = tx1.toObject();
		expect(d1.type).toBe(Transaction.TYPES.CREATE);
		expect(d1.modelName).toBe('test');
		expect(d1.time).toBe(tx1.time);
		expect(d1.model).toEqual(m1.toObject());

		var d2 = tx2.toObject();
		expect(d2.type).toBe(Transaction.TYPES.UPDATE);
		expect(d2.modelName).toBe('test');
		expect(d2.time).toBe(tx2.time);
		expect(d2.model).toEqual(m2.toObject());
	});


	/*
	fromObject
	 */
	it('fromObject: Can convert data back into a transaction and instantiated model', function(){
		var m1 = TestModel.create({id: 2, name: 'david'});
		var m2 = TestModel.create({name: 'john'});

		var tx1 = new Transaction(Transaction.TYPES.CREATE,m1);
		var tx2 = new Transaction(Transaction.TYPES.UPDATE,m2);

		var d1 = tx1.toObject();
		var d2 = tx2.toObject();
		
		var tx10 = new Transaction(d1);
		expect(tx10.type).toBe(Transaction.TYPES.CREATE);
		expect(tx10.time).toBe(tx1.time);
		expect(tx10.modelName).toBe('test');
		expect(typeof tx10.model.getPrimaryKey === 'function').toBeTruthy();

		expect(tx10.model.id).toBe(m1.id);
		expect(tx10.model.__existsRemotely).toBe(m1.__existsRemotely);
		expect(tx10.model.name).toBe('david');



		var tx11 = new Transaction(d2);
		expect(tx11.type).toBe(Transaction.TYPES.UPDATE);
		expect(tx11.time).toBe(tx2.time);
		expect(tx11.modelName).toBe('test');
		expect(typeof tx11.model.getPrimaryKey === 'function').toBeTruthy();

		expect(tx11.model.id).toBe(m2.id);
		expect(tx11.model.__existsRemotely).toBe(m2.__existsRemotely);
		expect(tx11.model.name).toBe('john');

	});

	/*
	 .resolve
	 */
	it('.resolve: Can set the resolved data on the transaction', function () {
		var m1 = TestModel.create({name: 'david'});
		var tx = new Transaction(Transaction.TYPES.CREATE, m1);

		tx.resolve({id: 20});
		expect(tx.resolveData.id).toBe(20);
	});
	
	
	
	
});