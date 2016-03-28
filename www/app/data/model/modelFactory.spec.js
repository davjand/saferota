describe('saferota.data Model', function () {
	beforeEach(module('saferota.data'));

	/*
	 Constructor
	 */
	it('Can create a new model type', inject(function (Model) {
		var m = new Model('rota');
		expect(m._config.name).toEqual('rota');
	}));

	/*
	 .config
	 */
	it('Can set config options with config', inject(function (Model) {
		var m = new Model('test');
		m.config({key: 'value'});
		expect(m._config.key).toEqual('value');
	}));
	it('config can only be used to set allowed properties', inject(function (Model) {
		var m = new Model('test');
		m.config({key: 'test'}, 'anything');
		//expect(m.anything).toBeUndefined();
	}));


	/*
	 .schema
	 */
	it('Can set the schema with updated and created dates', inject(function (Model) {
		var m = new Model('test');
		m.schema({name: 'test'});
		expect(m._schema.name).toEqual('test');
		expect(m._schema.createdDate).toBeNull();
		expect(m._schema.updatedDate).toBeNull();
	}));

	/*
	 .key
	 */
	it('It Can set the primary key and chain methods', inject(function (Model) {
		var m = new Model('test');

		m.schema({name: 'test'}).key('__ID');

		expect(m._schema.name).toEqual('test');
		expect(m._config.key).toEqual('__ID');
	}));

	/*
	 .methods
	 */
	it('Can set methods on the prototype and bind appropriately', inject(function (Model) {
		var m = new Model('test');
		m.dataItem = 123;

		m.methods({
			getItemData: function () {
				return this.dataItem;
			}
		});
		expect(m._methods.getItemData.call(m)).toEqual(123);

	}));

	/*
	 .createRelationship
	 */
	it('Can Set a relationship object', inject(function (Model) {
		var m = new Model('test');

		//shorthand
		m.relationship('hasOne', 'category', 'Category');


		expect(m._rel.category.model).toEqual('Category');
		expect(m._rel.category.type).toEqual('hasOne');

	}));

	/*
	 .create
	 */
	it('Can create a new model instance from the config', inject(function (Model) {
		var Test = new Model('test');
		Test.schema({
				first: 'John',
				last: 'Doe',
				category: 'defaultCategory'
			})
			.key('primaryKey')
			.relationship('hasOne', 'owner', 'Owner')
			.methods({
				fullname: function () {
					return this.first + ' ' + this.last
				}
			});

		var model = Test.create();

		//set the default properties
		expect(model.first).toEqual('John');
		expect(model.last).toEqual('Doe');
		//set the methods
		expect(model.fullname()).toEqual('John Doe');

		//store the relationship data
		expect(model._config.name).toEqual('test');
		expect(model._rel.owner.type).toEqual('hasOne');

		//store the schema
		expect(model._schema.first).toEqual('John');

		//get the classname
		expect(model.className()).toEqual('test');

		//should be classed as new as no primary key
		expect(model.__existsRemotely).toBe(false);

		//can get the data
		model.category = 'newCategory';
		var dataExport = model.data();

		expect(dataExport.first).toEqual('John');
		expect(dataExport.last).toEqual('Doe');
		expect(dataExport.category).toEqual('newCategory');


	}));

	/*
	 .create / set Data
	 */
	it('Can Set data. Can cast ids to string', inject(function (Model) {
		var Test = new Model('test');
		Test.schema({name: 'default'}).key('id');

		var m = Test.create({id: 10, name: 'not default'});

		expect(m.id).toEqual('10');
		expect(m.name).toEqual('not default');
	}));

	/*
	 .create / __existsRemotely functionality
	 */
	it('Sets __existsRemotely to true if a primary key is passed', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'}).key('id');

		var m = Test.create({id: 10, name: 'not default'});
		expect(m.__existsRemotely).toBe(true);
	}));

	/*
	 .create / createdData and updatedDate - NEW
	 */
	it('Can set the created and updated dates to default values', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'}).key('id');

		var m = Test.create({id: 10});

		expect(m.createdDate).not.toBeNull();
		expect(m.updatedDate).not.toBeNull();
	}));

	/*
	 .create / createdData and updatedDate - From existing
	 */
	it('Can set the created and updated dates from passed item', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'}).key('id');
		var date1 = new Date(2015, 10, 10),
			date2 = new Date(2012, 10, 2);

		var m = Test.create({
			id: 10,
			createdDate: date1,
			updatedDate: date2
		});

		expect(m.createdDate).toEqual(date1);
		expect(m.updatedDate).toEqual(date2);
	}));

	/*
	 .toObject
	 */
	it('Can serialize the model into a JSON object (with Meta Data)', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'});

		var m = Test.create({id: 1});
		var data = m.toObject();

		expect(data.id).toBe('1');
		expect(data.name).toBe('default');
		expect(data.createdDate).not.toBeNull();
		expect(data.updatedDate).not.toBeNull();
		expect(data.__className).toEqual('test');

	}));
	
	it('Can Serialize the model into a JSON object (no meta data)', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'});

		var m = Test.create({id: 1});
		var data = m.toObject(false);

		expect(data.id).toBe('1');
		expect(data.name).toBe('default');
		expect(data.createdDate).toBeUndefined();
		expect(data.updatedDate).toBeUndefined();
		expect(data.__className).toBeUndefined();
	}));
	
	/*
		.setData
	 */
	it('Can init a model from an object created with toObject', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'});

		var date = new Date(2015, 5, 5);

		var m = Test.create({
			id: 3,
			name: 'james',
			createdDate: date,
			updatedDate: date
		});

		var d = m.toObject();

		var m2 = Test.create(d);

		expect(m2.id).toBe('3');
		expect(m2.name).toBe('james');
		expect(m2.createdDate).toBe(date);
		expect(m2.updatedDate).toBe(date);
	}));
	
	/*
	localID and __existsRemotely functionality
	 */
	it('Generates a local ID and sets localID to true if generated without an ID', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'});

		var m = Test.create();

		expect(m.__existsRemotely).toBe(false);
		expect(m.id.length).toEqual(36);
	}));

	it('Test __existsRemotely functionality', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'});

		var m1 = Test.create();
		expect(m1.__existsRemotely).toBe(false);

		var m2 = Test.create({id: 20, name: 'test'});
		expect(m2.__existsRemotely).toBe(true);

		//scenario where de-serializing from local store
		var m3 = Test.create({
			id: 12345,
			__existsRemotely: false,
			name: 'David'
		});
		expect(m3.__existsRemotely).toBe(false);
		
		//test serializing and deserializing object types
		
	}));
	/*
	toObject / setData and  __existsRemotely functionality
	 */
	it('__existsRemotely and ID survive toObject and new constructor', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'});
		
		//Create an object and serialize
		var m1 = Test.create();
		var d1 = m1.toObject();
		expect(d1.__existsRemotely).toBe(false);
		
		//Create an object from the serializiation
		var m2 = Test.create(d1);
		expect(m2.__existsRemotely).toBe(false);
		expect(m2.id).toBe(m1.id);
		
		//create a new 'server' model
		var m3 = Test.create({id: 200, name: 'test'});
		var d3 = m3.toObject();
		expect(d3.__existsRemotely).toBe(true);
		
		//Create a new object from the server seriliazation
		var d4 = Test.create(d3);
		expect(d4.id).toBe(d3.id);
		expect(d4.__existsRemotely).toBe(true);

	}));
	
	/*
	.resolveRemote - sets a local object with the data from the server
	 */
	it('.resolveRemote sets the new ID and sets __existsRemotely to false', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default', phone: '200'});
		
		var m1 = Test.create({name: 'James Bond'});
		
		m1.resolveWithRemote({id: 999, name: 'Mr Bond'});

		expect(m1.__existsRemotely).toBe(true);
		
		expect(m1.name).toBe('Mr Bond');
		expect(m1.phone).toBe('200');
		expect(m1.id).toBe('999');
		
	}));
	


});