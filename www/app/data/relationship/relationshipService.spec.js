describe('saferota.data RelationshipService', function () {
	beforeEach(module('saferota.data'));

	var RelationshipService, ModelService, RepositoryService, DataStore, RequestService,
		$rootScope, $q,
		Person,
		House,
		Room;

	// var p1, p2, p3,
	// 	h1, h2, h3,
	// 	r1, r2, r3, r4, r5;

	function _d() {
		$rootScope.$apply();
	}


	/*
	 *
	 * Due to the nature of promises and the digest cycle
	 * It is far easier to keep this stuff within each test!
	 *
	 */
	function _up(models) {
		return DataStore.syncAll().then(function () {
			return DataStore.save(models);
		});
	}

	function _down(done) {
		return DataStore.clearAll()
			.then(function () {
				ModelService.clear();
				RepositoryService.clear();
				if (done) {
					done();
				}
			});
	}

	beforeEach(inject(function (_RelationshipService_,
								_DataStore_,
								_ModelService_,
								_RepositoryService_,
								_RequestService_,
								_$rootScope_,
								_$q_) {
		$rootScope = _$rootScope_;
		RelationshipService = _RelationshipService_;
		ModelService = _ModelService_;
		RepositoryService = _RepositoryService_;
		DataStore = _DataStore_;
		RequestService = _RequestService_;
		$q = _$q_;

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

		// p1 = Person.create({name: 'Bob'}, $rootScope);
		// p2 = Person.create({name: 'David'}, $rootScope);
		// p3 = Person.create({name: 'James'}, $rootScope);
		//
		// h1 = House.create({ number: 1}, $rootScope);
		// h2 = House.create({number: 20}, $rootScope);
		// h3 = House.create({number: 300}, $rootScope);
		//
		// r1 = Room.create({name: 'Dining Room'}, $rootScope);
		// r2 = Room.create({ name: 'Living Room'}, $rootScope);
		// r3 = Room.create({name: 'Kitchen'}, $rootScope);
		// r4 = Room.create({name: 'Bathroom'}, $rootScope);
		// r5 = Room.create({name: 'Garage'}, $rootScope);

	}));


	it('Initializes', function () {
		expect(RelationshipService).not.toBeNull();
	});


	/*
	 * .setRelated
	 */
	it('setRelated for hasOne local key', function (done) {
		var p1 = Person.create({name: 'Bob'}, $rootScope);
		var h1 = House.create({number: 1}, $rootScope);

		_up([p1, h1]).then(function () {
			return RelationshipService.setRelated(p1, 'house', h1)
		}).then(function () {
			expect(p1.house).toBe(h1.id);
			return _down(done);
		});
		_d();
	});

	it('setRelated for hasOne foreign key (no previous relationship)', function (done) {
		var p1 = Person.create({name: 'Bob'}, $rootScope);
		var h1 = House.create({number: 1}, $rootScope);

		_up([p1, h1]).then(function () {
			return RelationshipService.setRelated(h1, 'owner', p1);
		}).then(function () {
			expect(p1.house).toBe(h1.id);
			expect(h1.owner).toBeUndefined();
			return _down(done);
		});
		_d();
	});

	it('setRelated for hasOne foreign key (previous relationship)', function (done) {
		var p1 = Person.create({name: 'Bob'}, $rootScope);
		var p2 = Person.create({name: 'David'}, $rootScope);
		var h1 = House.create({number: 1}, $rootScope);

		_up([p1, h1]).then(function () {
			return RelationshipService.setRelated(h1, 'owner', p1);
		}).then(function () {
			/*
			 A key has been set, now we need to change it
			 The previous needs to be unset as is a hasOne relationship
			 */
			return RelationshipService.setRelated(h1, 'owner', p2);
		}).then(function () {
			expect(p2.house).toBe(h1.id);
			expect(p1.house).toBe(null);
			return _down(done);
		});

		_d();
	});

	it('SetRelated for hasMany (push - single)', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var r1 = Room.create({name: 'Dining Room'}, $rootScope);


		_up([h1, r1]).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', r1);
		}).then(function () {
			expect(r1.house).toBe(h1.id);
			_down(done);
		});
		_d();
	});

	it('SetRelated for hasMany (push - multiple)', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var r1 = Room.create({name: 'Dining Room'}, $rootScope),
			r2 = Room.create({name: 'Living Room'}, $rootScope),
			r3 = Room.create({name: 'Kitchen'}, $rootScope);


		_up([h1, r1, r2, r3]).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3])
		}).then(function () {
			expect(r1.house).toBe(h1.id);
			expect(r2.house).toBe(h1.id);
			expect(r3.house).toBe(h1.id);
			_down(done);
		});
		_d();
	});

	it('setRelated for hasMany (reset)', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var r1 = Room.create({name: 'Dining Room'}, $rootScope),
			r2 = Room.create({name: 'Living Room'}, $rootScope),
			r3 = Room.create({name: 'Kitchen'}, $rootScope),
			r4 = Room.create({name: 'Bathroom'}, $rootScope);

		_up([h1, r1, r2, r3, r4]).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]);
		}).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r4], true);
		}).then(function () {
			expect(r1.house).toBeNull();
			expect(r2.house).toBeNull();
			expect(r3.house).toBeNull();
			expect(r4.house).toBe(h1.id);
			_down(done);
		});
		_d();
	});

	xit('setRelated for hasMany (all) local key', function () {

	});


	/*
	 * .removeRelated
	 */
	it('removeRelated for hasOne local key (no set)', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var p1 = Person.create({name: 'Bob', house: h1.id}, $rootScope);

		_up([h1, p1]).then(function () {
			return RelationshipService.removeRelated(p1, 'house');
		}).then(function () {
			expect(p1.house).toBe(null);
			return _down(done);
		});
		_d();

	});
	//@TODO make unit test pass 100% time
	xit('removeRelated for hasOne local key', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var p1 = Person.create({name: 'Bob'}, $rootScope);


		_up([h1, p1]).then(function () {
			return RelationshipService.setRelated(p1, 'house', h1);
		}).then(function () {
			return RelationshipService.removeRelated(p1, 'house');
		}).then(function () {
			return RequestService.next(true);
		});
		_d();
		expect(p1.house).toBe(null);

		_down(done);
		_d();
	});

	//@TODO make unit test pass 100% time
	xit('removeRelated for hasOne foreign key', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var p1 = Person.create({name: 'Bob'}, $rootScope);

		_up([h1, p1]).then(function () {
			return RelationshipService.setRelated(h1, 'owner', p1);
		}).then(function () {
			return RelationshipService.removeRelated(h1, 'owner');
		}).then(function () {
			expect(p1.house).toBe(null);
			_down(done);
		});
		_d();
	});

	//@TODO make unit test pass 100% time
	xit('removeRelated for hasMany foreign key', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var r1 = Room.create({name: 'Dining Room'}, $rootScope),
			r2 = Room.create({name: 'Living Room'}, $rootScope),
			r3 = Room.create({name: 'Kitchen'}, $rootScope);


		_up([h1, r1, r2, r3]).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3])
		}).then(function () {
			return RelationshipService.removeRelated(h1, 'rooms', [r1, r3]);
		}).then(function () {

			expect(r1.house).toBeNull();
			expect(r2.house).toBe(h1.id);
			expect(r3.house).toBeNull();
			_down(done);
		});
		_d();
	});

	//@TODO make unit test pass 100% time
	xit('removeRelated for hasMany local key (all)', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var r1 = Room.create({name: 'Dining Room'}, $rootScope),
			r2 = Room.create({name: 'Living Room'}, $rootScope),
			r3 = Room.create({name: 'Kitchen'}, $rootScope);


		_up([h1, r1, r2, r3]).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]);
		}).then(function () {
			return RelationshipService.removeRelated(h1, 'rooms');
		}).then(function () {
			expect(r1.house).toBeNull();
			expect(r2.house).toBeNull();
			expect(r3.house).toBeNull();

			_down(done);
		});
		_d();
	});

	//@TODO make unit test pass 100% time
	xit('removeRelated for hasMany (Inverse)', function (done) {
		var h1 = House.create({number: 1}, $rootScope);
		var r1 = Room.create({name: 'Dining Room'}, $rootScope),
			r2 = Room.create({name: 'Living Room'}, $rootScope),
			r3 = Room.create({name: 'Kitchen'}, $rootScope);


		_up([h1, r1, r2, r3]).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3])
		}).then(function () {
			return RelationshipService.removeRelated(r1, 'house');
		}).then(function () {
			expect(r1.house).toBeNull();
			expect(r2.house).toBe(h1.id);
			expect(r3.house).toBe(h1.id);
			_down(done);
		});
		_d();
	});

	xit('removeRelated for hasMany (all) local key', function () {

	});


	/*
	 * .getRelated
	 */
	it('getRelated for hasOne local key', function (done) {

		var p1 = Person.create({name: 'Bob'}, $rootScope);
		var h1 = House.create({number: 1}, $rootScope);

		_up([p1, h1]).then(function () {
			return RelationshipService.setRelated(p1, 'house', h1);
		}).then(function () {
			return RelationshipService.getRelated(p1, 'house');
		}).then(function (item) {
			expect(item).toBe(h1);
			_down(done);
		});
		_d();
	});

	it('getRelated for hasOne foreign key', function (done) {
		var p1 = Person.create({name: 'Bob'}, $rootScope);
		var h1 = House.create({number: 1}, $rootScope);

		_up([p1, h1]).then(function () {
			return RelationshipService.setRelated(h1, 'owner', p1);
		}).then(function () {
			return RelationshipService.getRelated(h1, 'owner');
		}).then(function (item) {
			expect(item).toBe(p1);
			_down(done);
		});
		_d();
	});

	it('getRelated for hasMany', function (done) {
		var h1 = House.create({number: 1}, $rootScope),
			r1 = Room.create({name: 'Dining Room'}, $rootScope),
			r2 = Room.create({name: 'Living Room'}, $rootScope),
			r3 = Room.create({name: 'Room'}, $rootScope);

		_up([h1, r1, r2, r3]).then(function () {
			return RelationshipService.setRelated(h1, 'rooms', [r1, r2, r3]);
		}).then(function () {
			return RelationshipService.getRelated(h1, 'rooms');
		}).then(function (rooms) {
			expect(rooms.length).toBe(3);
			expect(rooms[0].id).toBe(r1.id);
			expect(rooms[1].id).toBe(r2.id);
			expect(rooms[2].id).toBe(r3.id);
			_down(done);
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

		var p1 = Person.create({name: 'Bob'}, $rootScope),
			h1 = House.create({number: 1}, $rootScope),
			r1 = Room.create({name: 'Dining Room'}, $rootScope),
			r2 = Room.create({name: 'Living Room'}, $rootScope);


		p1.$getRel('house');
		expect(RelationshipService.getRelated).toHaveBeenCalledWith(
			p1,
			'house'
		);

		p1.$setRel('house', h1);
		expect(RelationshipService.setRelated).toHaveBeenCalledWith(
			p1,
			'house',
			h1
		);
		p1.$removeRel('house');
		expect(RelationshipService.removeRelated).toHaveBeenCalledWith(
			p1,
			'house'
		);

		h1.$setRel('rooms', [r1, r2], true);
		expect(RelationshipService.setRelated).toHaveBeenCalledWith(
			h1,
			'rooms',
			[r1, r2],
			true
		);

	});

});
