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
		expect(model._isNew).toBeTruthy();

		//can get the data
		model.category = 'newCategory';
		var dataExport = model.data();

		expect(dataExport.first).toEqual('John');
		expect(dataExport.last).toEqual('Doe');
		expect(dataExport.category).toEqual('newCategory');


	}));

	it('Can Set data', inject(function (Model) {
		var Test = new Model('test');
		Test.schema({name: 'default'}).key('id');

		var m = Test.create({id: 10, name: 'not default'});

		expect(m.id).toEqual(10);
		expect(m.name).toEqual('not default');
	}));

	it('Sets isNew to false if a primary key is passed', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'}).key('id');

		var m = Test.create({id: 10, name: 'not default'});
		expect(m._isNew).toBeFalsy();
	}));

	it('Can set the created and updated dates to default values', inject(function (Model) {
		var Test = new Model('test').schema({name: 'default'}).key('id');

		var m = Test.create({id: 10});

		expect(m.createdDate).not.toBeNull();
		expect(m.updatedDate).not.toBeNull();
	}));

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


});