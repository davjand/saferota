describe('saferota.core rotaGeoFenceService', function () {
	beforeEach(module('saferota.core'));

	var geofence, RotaGeoFenceService, Rota, RotaLocation, $rootScope, $ionicPlatform, $q, DataStore;

	beforeEach(inject(function (_geofence_, _RotaGeoFenceService_, _Rota_, _RotaLocation_, _$rootScope_, _$ionicPlatform_, _$q_, _DataStore_) {
		geofence = _geofence_;
		RotaGeoFenceService = _RotaGeoFenceService_;
		Rota = _Rota_;
		RotaLocation = _RotaLocation_;
		$rootScope = _$rootScope_;
		$ionicPlatform = _$ionicPlatform_;
		$q = _$q_;
		DataStore = _DataStore_;
	}));

	beforeEach(function (done) {
		$ionicPlatform.ready(function () {
			done();
		})
	});

	function _d() {
		$rootScope.$digest();
	}

	//Init
	it('Can mock the geofence service', function (done) {
		geofence.ready().then(function () {
			expect(geofence.api.addOrUpdate).toBeDefined();
			done();
		});
		_d();
	});

	//get an active list of geofences
	it('.getActiveLocations returns a list of geofences', function (done) {
		geofence.ready().then(function () {
			spyOn(geofence.api, 'getWatched').and.returnValue($q.when('[{"id":"test"},{"id": "test2"}]'));
			spyOn(RotaLocation, '$find').and.returnValue($q.when(['test']));

			return RotaGeoFenceService.getActiveLocations();
		}).then(function (locations) {
			/*
			 * should have done a search
			 */
			expect(RotaLocation.$find).toHaveBeenCalledWith({
				filter: {
					uniqueIdentifier: ['test', 'test2']
				}
			});

			expect(locations.length).toBe(1);
			done();
		});
		_d();
	});

	//.getActiveRotas
	it('.getActiveRotas returns a list of active rotas', function (done) {

		var l1 = RotaLocation.create({objectId: 10, rota: "1"}),
			l2 = RotaLocation.create({objectId: 11, rota: "2"}),
			l3 = RotaLocation.create({objectId: 12, rota: "3"});

		spyOn(DataStore, 'save').and.returnValue($q.when());
		spyOn(RotaLocation, '$find').and.returnValue($q.when([l1, l2]));


		geofence.ready().then(function () {
			spyOn(geofence.api, 'getWatched').and.returnValue($q.when(
				'[{"id": "10"},{"id": "11"}]'
			));

			return RotaGeoFenceService.getActiveRotaIds();
		}).then(function (rotas) {
			expect(rotas.length).toBe(2);
			expect(rotas[0]).toEqual("1");
			expect(rotas[1]).toEqual("2");
			done();
		});

		_d();
	});

	//.locationIsActive
	it('.locationIsActive returns true if the location is active', function (done) {
		var l1 = RotaLocation.create({objectId: "10", rota: "1", uniqueIdentifier: 'test123'});

		geofence.ready().then(function () {
			spyOn(RotaGeoFenceService, 'getActiveLocations').and.returnValue($q.when([l1]));

			return RotaGeoFenceService.locationIsActive(l1);
		}).then(function (result) {
			expect(result).toBe(true);
			done();
		});

		_d();
	});
	it('.locationIsActive returns false if the location is inactive', function (done) {

		var l1 = RotaLocation.create({objectId: "10", rota: "1", uniqueIdentifier: 'test123'});
		var l2 = RotaLocation.create({objectId: "11", rota: "1", uniqueIdentifier: 'test123'});

		geofence.ready().then(function () {
			spyOn(RotaGeoFenceService, 'getActiveLocations').and.returnValue($q.when([l2]));

			return RotaGeoFenceService.locationIsActive(l1);
		}).then(function (result) {
			expect(result).toBe(false);
			done();
		});

		_d();
	});

	//.isActive
	it('.isActive returns true if the rota is active', function (done) {
		var l1 = RotaLocation.create({objectId: "10", rota: "1"}),
			r1 = Rota.create({objectId: '1'});

		spyOn(r1, '$getRel').and.returnValue($q.when([l1]));

		geofence.ready().then(function () {
			spyOn(RotaGeoFenceService, 'getActiveLocations').and.returnValue($q.when([l1]));

			return RotaGeoFenceService.isActive(r1);
		}).then(function (result) {
			expect(result).toBe(true);
			done();
		});

		_d();
	});
	it('.isActive returns false if the rota is inactive', function (done) {
		var l1 = RotaLocation.create({objectId: "10", rota: "1"}),
			r1 = Rota.create({objectId: '1'});

		spyOn(r1, '$getRel').and.returnValue($q.when([l1]));

		geofence.ready().then(function () {
			spyOn(geofence.api, 'getWatched').and.returnValue($q.when(
				'[{"id": "11"}]'
			));

			return RotaGeoFenceService.isActive(r1);
		}).then(function (result) {
			expect(result).toBe(false);
			done();
		});

		_d();
	});

	//.activateLocation
	it('.activateLocation can activate a location', function (done) {
		var l1 = RotaLocation.create({objectId: "10", rota: "1"});

		geofence.ready().then(function () {
			spyOn(geofence.api, 'getWatched').and.returnValue($q.when('[]'));
			spyOn(geofence.api, 'addOrUpdate').and.returnValue($q.when());
			return RotaGeoFenceService.activateLocation(l1);
		}).then(function () {
			expect(geofence.api.addOrUpdate).toHaveBeenCalled();
			done();
		});
		_d();
	});

	//.deactivateLocation
	it('.deactivateLocation can deactivate a location', function (done) {
		var l1 = RotaLocation.create({objectId: "10", rota: "1", uniqueIdentifier: 'test123'});

		geofence.ready().then(function () {
			spyOn(RotaGeoFenceService, 'getActiveLocations').and.returnValue($q.when([l1]));
			spyOn(geofence.api, 'remove').and.returnValue($q.when());
			return RotaGeoFenceService.deactivateLocation(l1);
		}).then(function () {
			expect(geofence.api.remove).toHaveBeenCalledWith("test123");
			done();
		});
		_d();
	});

	it('.deactivateLocation should throw an error if already active', function (done) {
		var l1 = RotaLocation.create({objectId: "10", rota: "1"});

		geofence.ready().then(function () {
			spyOn(geofence.api, 'getWatched').and.returnValue($q.when('[]'));
			return RotaGeoFenceService.deactivateLocation(l1, false);
		}).then(function () {
			expect(true).toBe(false);
		}, function (error) {
			expect(error).toBeDefined();
			done();
		});
		_d();
	});

	//.activate
	it('.activate can activate all locations in a rota', function (done) {
		var l1 = RotaLocation.create({objectId: "10", rota: "1"}),
			l2 = RotaLocation.create({objectId: "11", rota: "1"}),
			r1 = Rota.create({objectId: '1'});

		spyOn(r1, '$getRel').and.returnValue($q.when([l1, l2]));

		geofence.ready().then(function () {
			spyOn(geofence.api, 'getWatched').and.returnValue($q.when('[]'));
			spyOn(RotaGeoFenceService, 'activateLocation').and.returnValue($q.when());
			return RotaGeoFenceService.activate(r1);
		}).then(function () {
			expect(RotaGeoFenceService.activateLocation).toHaveBeenCalledWith(l1);
			expect(RotaGeoFenceService.activateLocation).toHaveBeenCalledWith(l2);

			done();
		});
		_d();
	});

	//.deactivate
	it('.deactivate can activate all locations in a rota', function (done) {
		var l1 = RotaLocation.create({objectId: "10", rota: "1"}),
			l2 = RotaLocation.create({objectId: "11", rota: "1"}),
			r1 = Rota.create({objectId: '1'});

		spyOn(r1, '$getRel').and.returnValue($q.when([l1, l2]));

		geofence.ready().then(function () {
			spyOn(geofence.api, 'getWatched').and.returnValue($q.when('[{"id":"10},{"id":"11}]'));
			spyOn(RotaGeoFenceService, 'deactivateLocation').and.returnValue($q.when());
			return RotaGeoFenceService.deactivate(r1);
		}).then(function () {
			expect(RotaGeoFenceService.deactivateLocation).toHaveBeenCalledWith(l1, undefined);
			expect(RotaGeoFenceService.deactivateLocation).toHaveBeenCalledWith(l2, undefined);

			done();
		});
		_d();
	});


});