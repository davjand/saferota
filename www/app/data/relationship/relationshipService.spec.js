describe('saferota.data RelationshipService', function () {
	beforeEach(module('saferota.data'));

	var RelationshipService, ModelService, RepositoryService, DataStore,
		$rootScope,
		Person,
		House,
		Room;

	var p1, p2, p3,
		h1, h2, h3,
		r1, r2, r3, r4, r5;

	function _d() {
		$rootScope.$digest();
	}

	beforeEach(inject(function (_RelationshipService_,
								_DataStore_,
								_ModelService_,
								_RepositoryService_,
								_$rootScope_) {
		$rootScope = _$rootScope_;
		RelationshipService = _RelationshipService_;
		ModelService = _ModelService_;
		RepositoryService = _RepositoryService_;
		DataStore = _DataStore_;

		RelationshipService.registerDataStore(DataStore);


		Person = DataStore.create('Person')
			.schema({name: ''})
			.relationship('hasOne', 'house', 'House');

		House = DataStore.create('House')
			.schema({number: 0})
			.relationship('hasOne', 'owner', 'Person.house')
			.relationship('hasMany', 'rooms', 'Room.house');

		Room = DataStore.create('Room')
			.schema({name: '', type: ''})
			.relationship('hasOne', 'house', 'House');

		p1 = Person.create({id: 1, name: 'Bob'}, $rootScope);
		p2 = Person.create({id: 2, name: 'David'}, $rootScope);
		p3 = Person.create({id: 3, name: 'James'}, $rootScope);

		h1 = House.create({id: 10, number: 1}, $rootScope);
		h2 = House.create({id: 11, number: 20}, $rootScope);
		h3 = House.create({id: 12, number: 300}, $rootScope);

		r1 = Room.create({id: 100, name: 'Dining Room'}, $rootScope);
		r2 = Room.create({id: 101, name: 'Living Room'}, $rootScope);
		r3 = Room.create({id: 102, name: 'Kitchen'}, $rootScope);
		r4 = Room.create({id: 103, name: 'Bathroom'}, $rootScope);
		r5 = Room.create({id: 104, name: 'Garage'}, $rootScope);

	}));

	afterEach(function () {
		ModelService.clear();
		RepositoryService.clear();
	});

	it('Initializes', function () {
		expect(RelationshipService).not.toBeNull();
	});


	/*
	 * .setRelated
	 */
	it('setRelated for hasOne local key', function (done) {

		RelationshipService.setRelated(p1, 'house', h1).then(function () {
			expect(p1.house).toBe('10');
			done();
		});
		_d();
	});

	it('setRelated for hasOne foreign key (no previous relationship)', function (done) {
		RelationshipService.setRelated(h1, 'owner', p1).then(function () {
			expect(p1.house).toBe('10');
			expect(h1.owner).toBeUndefined();
			done();
		}, function () {
			expect(true).toBe(false);
			done();
		});
		_d();
	});

	it('setRelated for hasOne foreign key (previous relationship)', function (done) {
		DataStore.syncAll().then(function () {
			return RelationshipService.setRelated(h1, 'owner', p1);
		}).then(function () {
			/*
			 A key has been set, now we need to change it
			 The previous needs to be unset as is a hasOne relationship
			 */
			return RelationshipService.setRelated(h1, 'owner', p2);
		}).then(function () {
			expect(p2.house).toBe('10');
			expect(p1.house).toBe(null);
			done();
		}, function () {
			expect(true).toBe(false);
			done();
		});

		_d();
	});

	it('SetRelated for hasMany (push - single)', function (done) {
		RelationshipService.setRelated(h1, 'rooms', r1).then(function () {
			expect(r1.house).toBe('10');
			done();
		}, function () {
			expect(true).toBe(false);
			done();
		});
		_d();
	});

	it('SetRelated for hasMany (push - multiple)', function (done) {
		RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]).then(function () {
			expect(r1.house).toBe('10');
			expect(r2.house).toBe('10');
			expect(r3.house).toBe('10');
			done();
		}, function () {
			expect(true).toBe(false);
			done();
		});
		_d();
	});

	it('setRelated for hasMany (reset)', function (done) {
		DataStore.syncAll().then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]);
		}).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r4], true);
		}).then(function () {
			expect(r1.house).toBeNull();
			expect(r2.house).toBeNull();
			expect(r3.house).toBeNull();
			expect(r4.house).toBe('10');
			done();
		}, function () {
			expect(true).toBe(false);
			done();
		});
		_d();
	});

	xit('setRelated for hasMany (all) local key', function () {

	});


	/*
	 * .removeRelated
	 */
	it('removeRelated for hasOne local key', function (done) {
		RelationshipService.setRelated(p1, 'house', h1).then(function () {
			return RelationshipService.removeRelated(p1, 'house');
		}).then(function () {
			expect(p1.house).toBe(null);
			done();
		}, function () {
			expect(true).toBe(false);
			done();
		});
		_d();
	});

	it('removeRelated for hasOne foreign key', function (done) {
		RelationshipService.setRelated(h1, 'owner', p1).then(function () {
			return RelationshipService.removeRelated(h1, 'owner');
		}).then(function () {
			expect(p1.house).toBe(null);
			done();
		}, function () {
			expect(true).toBe(false);
			done();
		});
		_d();
	});

	it('removeRelated for hasMany foreign key', function (done) {
		RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]).then(function () {
			return RelationshipService.removeRelated(h1, 'rooms', [r1, r3]);
		}).then(function () {
			expect(r1.house).toBeNull();
			expect(r2.house).toBe('10');
			expect(r3.house).toBeNull();

			done();
		}, function () {
			expect(true).toBe(false);
			done();
		});
		_d();
	});

	it('removeRelated for hasMany local key (all)', function (done) {
		DataStore.syncAll().then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]);
		}).then(function () {
			return RelationshipService.removeRelated(h1, 'rooms');
		}).then(function () {
			expect(r1.house).toBeNull();
			expect(r2.house).toBeNull();
			expect(r3.house).toBeNull();

			done();
		});
		_d();
	});

	it('removeRelated for hasMany (Inverse)', function (done) {
		RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]).then(function () {
			return RelationshipService.removeRelated(r1, 'house');
		}).then(function () {
			expect(r1.house).toBeNull();
			expect(r2.house).toBe('10');
			expect(r3.house).toBe('10');
			done();
		});
		_d();
	});

	xit('removeRelated for hasMany (all) local key', function () {

	});


	/*
	 * .getRelated
	 */
	it('getRelated for hasOne local key', function (done) {

		DataStore.syncAll().then(function () {
			return RelationshipService.setRelated(p1, 'house', h1);
		}).then(function () {
			return RelationshipService.getRelated(p1, 'house');
		}).then(function (item) {
			expect(item).toBe(h1);
			done();
		});
		_d();
	});

	it('getRelated for hasOne foreign key', function (done) {
		DataStore.syncAll().then(function () {
			return RelationshipService.setRelated(h1, 'owner', p1);
		}).then(function () {
			return RelationshipService.getRelated(h1, 'owner');
		}).then(function (item) {
			expect(item).toBe(p1);
			done();
		});
		_d();
	});

	it('getRelated for hasMany', function (done) {
		DataStore.syncAll().then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]);
		}).then(function () {
			return RelationshipService.getRelated(h1, 'rooms');
		}).then(function (rooms) {
			expect(rooms.length).toBe(3);
			expect(rooms[0].id).toBe(r1.id);
			expect(rooms[1].id).toBe(r2.id);
			expect(rooms[2].id).toBe(r3.id);
			done();
		});
		_d();
	});

	xit('getRelated for hasMany (all) local key', function () {

	});

	/*
	 .decorate
	 */
	it('.decorate can decorate a model with getters and setters for relationships', function () {

		spyOn(RelationshipService, 'getRelated');
		spyOn(RelationshipService, 'setRelated');
		spyOn(RelationshipService, 'removeRelated');

		/*
		 These should be called by the datastore
		 */
		//RelationshipService.decorate(p1);
		//RelationshipService.decorate(h1);

		p1.$get('house');
		expect(RelationshipService.getRelated).toHaveBeenCalledWith(
			p1,
			'house'
		);

		p1.$set('house', h1);
		expect(RelationshipService.setRelated).toHaveBeenCalledWith(
			p1,
			'house',
			h1
		);
		p1.$remove('house');
		expect(RelationshipService.removeRelated).toHaveBeenCalledWith(
			p1,
			'house'
		);

		h1.$set('rooms', [r1, r2], true);
		expect(RelationshipService.setRelated).toHaveBeenCalledWith(
			h1,
			'rooms',
			[r1, r2],
			true
		);

	});

});