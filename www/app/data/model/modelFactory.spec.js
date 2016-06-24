describe('saferota.data Model', function () {
	beforeEach(module('saferota.data'));

	var Model;

	beforeEach(inject(function (_Model_) {
		Model = _Model_;
	}));

	/*
	 Constructor
	 */
	it('Can create a new model type', function () {
		var m = new Model('rota');
		expect(m._config.name).toEqual('rota');
	});

	/*
	 .config
	 */
	it('Can set config options with config', function () {
		var m = new Model('test');
		m.config({key: 'value'});
		expect(m._config.key).toEqual('value');
	});
	it('config can only be used to set allowed properties', function () {
		var m = new Model('test');
		m.config({key: 'test'}, 'anything');
		//expect(m.anything).toBeUndefined();
	});


	/*
	 .schema
	 */
	it('Can set the schema with updated and created dates', function () {
		var m = new Model('test');
		m.schema({name: 'test'});
		expect(m._schema.name).toEqual('test');
		expect(m._schema.createdDate).toBeNull();
		expect(m._schema.updatedDate).toBeNull();
	});

	/*
	 .key
	 */
	it('It Can set the primary key and chain methods', function () {
		var m = new Model('test');

		m.schema({name: 'test'}).key('__ID');

		expect(m._schema.name).toEqual('test');
		expect(m._config.key).toEqual('__ID');
	});

	/*
	 .methods
	 */
	it('Can set methods on the prototype and bind appropriately', function () {
		var m = new Model('test');
		m.dataItem = 123;

		m.methods({
			getItemData: function () {
				return this.dataItem;
			}
		});
		expect(m._methods.getItemData.call(m)).toEqual(123);

	});

	/*
	 .relationship
	 */
	it('Can Set a relationship object', function () {
		var m = new Model('test');

		//shorthand
		m.relationship('hasOne', 'category', 'Category');


		expect(m._rel.category.model).toEqual('Category');
		expect(m._rel.category.type).toEqual('hasOne');

	});

	it('.relationship can determine if key is local for on foreign object', function () {
		var m = new Model('test');
		m.relationship('hasOne', 'category', 'Category');
		expect(m._rel.category.keyType).toBe('local');
		expect(m._rel.category.model).toBe('Category');

		var Profile = new Model('profile');
		Profile.relationship('hasOne', 'user', 'User.profile');

		expect(Profile._rel.user.model).toBe('User');
		expect(Profile._rel.user.keyType).toBe('foreign');
		expect(Profile._rel.user.key).toBe('profile');
	});

	/*
	 .validators
	 */
	it('.validators sets the validators object for a model', function () {
		var m = new Model('test').schema({name: ''});
		m.validators({
			name: true
		});

		expect(m._validators.name).toBe(true);
	});


	/*
	 .create
	 */
	it('.create throws an error if no schema defined', function () {
		var Test = new Model('test');
		var error = false;
		try {
			var t = Test.create();
		} catch (err) {
			error = true;
		}
		expect(error).toBe(true);
	});
	it('Can create a new model instance from the config', function () {
		var Test = new Model('test');
		Test.schema({
			first:    'John',
			last:     'Doe',
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


	});

	/*
	 .create / set Data
	 */
	it('Can Set data. Can cast ids to string', function () {
		var Test = new Model('test');
		Test.schema({name: 'default'}).key('id');

		var m = Test.create({id: 10, name: 'not default'});

		expect(m.id).toEqual('10');
		expect(m.name).toEqual('not default');
	});

	/*
	 .create / __existsRemotely functionality
	 */
	it('Sets __existsRemotely to true if a primary key is passed', function () {
		var Test = new Model('test').schema({name: 'default'}).key('id');

		var m = Test.create({id: 10, name: 'not default'});
		expect(m.__existsRemotely).toBe(true);
	});

	/*
	 .create / createdData and updatedDate - NEW
	 */
	it('Can set the created and updated dates to default values', function () {
		var Test = new Model('test').schema({name: 'default'}).key('id');

		var m = Test.create({id: 10});

		expect(m.createdDate).not.toBeNull();
		expect(m.updatedDate).toBeNull();
	});

	/*
	 .create / createdData and updatedDate - From existing
	 */
	it('Can set the created and updated dates from passed item', function () {
		var Test = new Model('test').schema({name: 'default'}).key('id');
		var date1 = new Date(2015, 10, 10),
			date2 = new Date(2012, 10, 2);

		var m = Test.create({
			id:          10,
			createdDate: date1,
			updatedDate: date2
		});

		expect(m.createdDate).toEqual(date1);
		expect(m.updatedDate).toEqual(date2);
	});

	/*
	 .toObject
	 */
	it('Can serialize the model into a JSON object (with Meta Data)', function () {
		var Test = new Model('test').schema({name: 'default'});

		var m = Test.create({id: 1});
		var data = m.toObject();

		expect(data.id).toBe('1');
		expect(data.name).toBe('default');
		expect(data.createdDate).not.toBeNull();
		expect(data.updatedDate).toBeNull();
		expect(data.__className).toEqual('test');

	});

	it('Can Serialize the model into a JSON object (no meta data)', function () {
		var Test = new Model('test').schema({name: 'default'});

		var m = Test.create({id: 1});
		var data = m.toObject(false);

		expect(data.id).toBe('1');
		expect(data.name).toBe('default');
		expect(data.createdDate).toBeUndefined();
		expect(data.updatedDate).toBeUndefined();
		expect(data.__className).toBeUndefined();
	});

	/*
	 .setData
	 */
	it('Can init a model from an object created with toObject', function () {
		var Test = new Model('test').schema({name: 'default'});

		var date = new Date(2015, 5, 5);

		var m = Test.create({
			id:          3,
			name:        'james',
			createdDate: date,
			updatedDate: date
		});

		var d = m.toObject();

		var m2 = Test.create(d);

		expect(m2.id).toBe('3');
		expect(m2.name).toBe('james');
		expect(m2.createdDate).toBe(date);
		expect(m2.updatedDate).toBe(date);
	});

	it('setData will set relationship data for hasOne local', function () {
		var Test = new Model('test')
			.schema({name: 'default'})
			.relationship('hasOne', 'category', 'Category')
			.relationship('hasOne', 'owner', 'Owner.test');

		var m = Test.create({
			id:       1,
			name:     'james',
			category: 10,
			owner:    5 //this should be on the other object
		});

		expect(m.category).toBe(10);
		expect(m.owner).toBeUndefined();
	});

	/*
	 localID and __existsRemotely functionality
	 */
	it('Generates a local ID and sets localID to true if generated without an ID', function () {
		var Test = new Model('test').schema({name: 'default'});

		var m = Test.create();

		expect(m.__existsRemotely).toBe(false);
		expect(m.id.length).toEqual(42);
	});

	it('Test __existsRemotely functionality', function () {
		var Test = new Model('test').schema({name: 'default'});

		var m1 = Test.create();
		expect(m1.__existsRemotely).toBe(false);

		var m2 = Test.create({id: 20, name: 'test'});
		expect(m2.__existsRemotely).toBe(true);

		//scenario where de-serializing from local store
		var m3 = Test.create({
			id:               12345,
			__existsRemotely: false,
			name:             'David'
		});
		expect(m3.__existsRemotely).toBe(false);

		//test serializing and deserializing object types

	});
	/*
	 toObject / setData and  __existsRemotely functionality
	 */
	it('__existsRemotely and ID survive toObject and new constructor', function () {
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

	});

	it('.toObject can omit the local id', function () {
		var Test = new Model('test').schema({name: 'default'});
		var m1 = Test.create();

		expect(m1.toObject(false, false).id).toBeUndefined();
	});

	it('.toObject includes relationship data', function () {
		var Test = new Model('test')
			.schema({name: 'default'})
			.relationship('hasOne', 'category', 'Category')
			.relationship('hasOne', 'owner', 'Owner.test');

		var m = Test.create({
			id:       1,
			name:     'james',
			category: 10,
			owner:    5 //this should be on the other object
		});

		var d = m.toObject();
		expect(d.category).toBe(10);
	});


	it('.isValid returns true if no validators', function () {
		var Test = new Model('test').schema({name: 'test'});

		var t = Test.create();

		expect(t.isValid()).toBe(true);

	});
	it('.isValid validates required parameters', function () {
		var Test =
			new Model('test')
				.schema({name: '', city: '', country: ''})
				.validators({name: true, city: false});

		var t = Test.create();

		expect(t.isValid()).toBe(false);

		t.name = 'James';
		expect(t.isValid()).toBe(true);

		t.name = null;
		expect(t.isValid()).toBe(false);


		t.name = 'David';
		t.city = null;
		expect(t.isValid()).toBe(true);
	});
	it('.isValid can validate via a function callback', function () {
		var Test =
			new Model('test')
				.schema({name: ''})
				.validators({
					name: function (value) {
						return value === 'john';
					}
				});

		var t = Test.create({name: 'james'});

		expect(t.isValid()).toBe(false);

		t.name = 'john';
		expect(t.isValid()).toBe(true);
	});

	/*
	 .resolveRemote - sets a local object with the data from the server
	 */
	it('.resolveRemote sets the new ID and sets __existsRemotely to false', function () {
		var Test = new Model('test').schema({name: 'default', phone: '200'});

		var m1 = Test.create({name: 'James Bond'});

		m1.resolveWithRemote({id: 999, name: 'Mr Bond'});

		expect(m1.__existsRemotely).toBe(true);

		expect(m1.name).toBe('Mr Bond');
		expect(m1.phone).toBe('200');
		expect(m1.id).toBe('999');

	});

	/*
	 Constructor callback
	 */
	it('Create can be passed a callback that is called everytime an instance is created', function () {
		var calls = 0,
			fx = function () {
				calls++;
			};

		var Test = new Model('test', fx).schema({name: 'test'});


		Test.create({});
		expect(calls).toBe(1);

		Test.create({id: 2});
		expect(calls).toBe(2);
	});

	/*
	 Event emitters
	 */
	describe('Event Emitters', function () {
		var Test;
		
		beforeEach(function () {
			Test = new Model('test').schema({name: '', city: ''});
		});
		
		it('Each model becomes an event emitter', function () {
			var t1 = Test.create();
			
			expect(t1.on).toBeDefined();
			expect(t1.off).toBeDefined();
			expect(t1.emit).toBeDefined();
			
			var v = 0;
			
			t1.on('test', function (a) {
				v = a;
			});
			t1.emit('test', 5);
			
			expect(v).toBe(5);

		});
		
		describe('.update ', function () {
			var t1, t2, called;
			
			beforeEach(function () {
				t1 = Test.create();
				t2 = Test.create({name: 'james', city: 'london'});
				called = false;
				
				t1.on('update', function () {
					called = true;
				});
			});
			
			it('triggers an event if forced', function () {
				t1.update(null, true);
				expect(called).toBe(true);
			});
			it('triggers an event if new data is different and sets the data', function () {
				t1.update(t2);
				expect(called).toBe(true);
				expect(t1.name).toBe('james');
				expect(t1.city).toBe('london');
				
			});
			it('does not trigger an event if the data is the same', function () {
				t1.name = 'james';
				t1.city = 'london';
				t1.id = t2.id;
				t1.update(t2);
				expect(called).toBe(false);
			});
			
		});

	});

	/*
	 Objects the same
	 */
	describe('.isEqual', function () {
		var Test, Test2, m1, m2;
		beforeEach(function () {
			Test = new Model('test')
				.schema({name: '', city: ''})
				.relationship('hasOne', 'country', 'Country');
			
			Test2 = new Model('test2').schema({name: '', city: ''});
			
			m1 = Test.create({id: 1, name: 'james'});
			m2 = Test2.create({name: 'james'});
		});
		
		it(' determines if models are the same or not', function () {
			//different models
			expect(m1.isEqual(m2)).toBe(false);
			
			//parameter differences
			var m3 = Test.create({id: 1, name: 'james'});
			expect(m1.isEqual(m3)).toBe(true);
			
			m3.city = 'London';
			expect(m1.isEqual(m3)).toBe(false);
			
			m1.city = 'London';
			expect(m1.isEqual(m3)).toBe(true);
			
			//objects
			m1.name = {first: 'james', last: 'bond'};
			m3.name = {first: 'james', last: 'bond'};
			expect(m1.isEqual(m3)).toBe(true);
			
			m3.name = {first: 'james', last: 'bone'};
			expect(m1.isEqual(m3)).toBe(false);
			
			//relationships
			var m4 = Test.create({name: 'james', country: 5});
			var m5 = Test.create({name: 'james', country: 3});
			
			expect(m4.isEqual(m5)).toBe(false);
		});
		
		it('checks ID', function () {
			m1 = Test.create({id: 2, name: 'james'});
			m2 = Test.create({id: 3, name: 'james'});
			
			expect(m1.isEqual(m2)).toBe(false);
			
		});


	});
	
	describe('model caching and dirty checking', function () {
		var Test, localObject, remoteObject;
		beforeEach(function () {
			Test = new Model('test').schema({name: '', city: ''});
			localObject = Test.create({name: 'james', city: 'london'});
			remoteObject = Test.create({id: 'test1', name: 'james2'});
		});
		
		it('.cacheCurrentState caches the current object', function () {
			localObject.cacheCurrentState();
			expect(localObject.__savedState.name).toBe('james');
			expect(localObject.__savedState.city).toBe('london');
		});
		
		it('.cacheCurrentState should be called for remote objects when constructed', function () {
			expect(remoteObject.__savedState.id).toBe('test1');
			expect(remoteObject.__savedState.name).toBe('james2');
		});
		
		it('isDirty should return true for new (non remote) objects', function () {
			expect(localObject.isDirty()).toBe(true);
		});
		it('isDirty should return false for new remote objects', function () {
			expect(remoteObject.isDirty()).toBe(false);
		});
		
	});

	//Decorating Models
	it('Can add decoraters to decorate a modle before it is created', function () {
		Model.addDecorator(function (Constructor) {
			Constructor.prototype.$test = function () {
				return 'test';
			}
		});

		var Test2 = new Model('test2').schema({name: '', city: ''});

		var t = Test2.create({name: 'james'});

		expect(t.$test()).toEqual('test');
	});

});