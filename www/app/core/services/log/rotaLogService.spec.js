describe('saferota.rota-log RotaLogService', function () {
	beforeEach(module('saferota.core'));

	var RotaLogService,
		Rota, RotaEvent, RotaTimespan, RotaLocation, DataStore, RequestService,
		$q, $rootScope, moment, GEOFENCE_EVENTS;

	var aLocation,
		aRota,
		aEnter1,
		aExit1;

	beforeEach(inject(function (_RotaLogService_,
								_Rota_,
								_RotaLocation_,
								_RotaEvent_,
								_RotaTimespan_,
								_$q_,
								_$rootScope_,
								_DataStore_,
								_RequestService_,
								_moment_,
								_GEOFENCE_EVENTS_) {

		RotaLogService = _RotaLogService_;
		Rota = _Rota_;
		RotaLocation = _RotaLocation_;
		RotaEvent = _RotaEvent_;
		RotaTimespan = _RotaTimespan_;
		$q = _$q_;
		$rootScope = _$rootScope_;
		DataStore = _DataStore_;
		RequestService = _RequestService_;
		moment = _moment_;
		GEOFENCE_EVENTS = _GEOFENCE_EVENTS_;


		DataStore.$alwaysSearchLocal = true;
		RequestService.$disableBackgroundQueueProcessing = true;


		aEnter1 = {
			id:             'unique1',
			transitionType: 1
		};
		aExit1 = {
			id:             'unique1',
			transitionType: 2
		};

		aLocation = RotaLocation.create({
			objectId:         'loc1',
			uniqueIdentifier: 'unique1',
			lat:              1.5,
			long:             1.5,
			rota:             'rota1'
		});
		aRota = Rota.create({
			objectId:           'rota1',
			adjustShiftStart:   0,
			adjustShiftEnd:     0,
			defaultShiftLength: 8
		});

	}));

	function _d() {
		$rootScope.$digest();
	}

	/*
	 * helper function to setup the data
	 * Easier to do per unit test than in before due to digest issues
	 *
	 */
	function _up() {
		return DataStore.clearAll().then(function () {
			return DataStore.save([aRota, aLocation]);
		});
	}


	//.createRotaEvent
	it('Can create a rota event from a transaction', function (done) {
		_up().then(function () {
			return RotaLogService.createRotaEvent(aEnter1);
		}).then(function (event) {
			expect(event.rota).toBe('rota1');
			expect(event.location).toBe('loc1');
			expect(event.timestamp).toBeDefined();
			expect(event.exited).toBe(false);
			expect(event.error).toBe(null);
			done();
		});
		_d();
	});
	it('Can create a rota event from a transaction with an error of no location found', function (done) {
		_up().then(function () {
			return RotaLogService.createRotaEvent({id: 200});
		}).then(function (event) {
			expect(event.error).not.toBe(null);
			done();
		});
		_d();
	});

	//.findEnterEvents
	it('.findEnterEvents can retrieve the events that correspond to entering', function (done) {
		var e1 = RotaEvent.create({ //should find
				objectId:      'e1',
				timestamp: 100,
				location:      'loc1',
				type:          1,
				exited:        false
			}),
			e2 = RotaEvent.create({ //should find
				objectId:  'e2',
				timestamp: 500,
				location:  'loc1',
				type:      1,
				exited:    false
			}),
			e3 = RotaEvent.create({ //should not find
				location: 'loc1',
				type:     2,
				exited:   false
			}),
			e4 = RotaEvent.create({ //should not find
				location: 'loc1',
				type:     1,
				exited:   true
			}),
			e5 = RotaEvent.create({ //should not find
				location: 'loc2',
				type:     1,
				exited:   false
			});

		var exitEvent = RotaEvent.create({
			location: 'loc1',
			type:     2
		});

		_up().then(function () {
			return DataStore.save([e1, e2, e3, e4, e5])
		}).then(function () {
			return RotaLogService.findEnterEvents(exitEvent);
		}).then(function (events) {
			expect(events.length).toBe(2);

			//should be sorted so latest is first
			expect(events[0].objectId).toBe('e2');
			expect(events[0].type).toBe(1);
			done();
		});

		_d();
	});

	//.processEnterEvents
	it('.processEnterEvents returns the first event', function () {
		RotaLogService.processEnterEvents([{id: 1}, {id: 2}, {id: 3}], aRota).then(function (foundEvent) {
			e = foundEvent;
		});
		$rootScope.$apply();
		expect(e.id).toBe(1);
	});
	it('.processEnterEvents returns null if an empty array', function () {
		RotaLogService.processEnterEvents([], aRota).then(function (foundEvent) {
			e = foundEvent;
		});
		$rootScope.$apply();
		expect(e).toBe(null);
	});
	it('.processEnterEvents sets errorflag and exited for previous events', function () {
		var events = [
			RotaEvent.create({ //should find
				objectId:  'e1',
				timestamp: 100,
				location:  'loc1',
				type:      1,
				exited:    false
			}),
			RotaEvent.create({ //should find
				objectId:  'e2',
				timestamp: 500,
				location:  'loc1',
				type:      1,
				exited:    false
			})
		];
		
		RotaLogService.processEnterEvents(events, aRota);
		$rootScope.$apply();
		expect(events[0].exited).toBe(true);
		expect(events[0].error).not.toBe(null);

	});


	//.createRotaTimeSpan
	it('.createRotaTimespan takes an enter and an exit and creates a timespan object', function () {
		var enter = moment('2013-02-08 12:00:00.000').valueOf();
		var exit = moment('2013-02-08 14:30:00.000').valueOf();

		var e1 = RotaEvent.create({ //should find
				objectId:      'e1',
				timestamp: enter,
				location:      'loc1',
				rota:          'rota1',
				type:          1,
				exited:        false
			}),
			e2 = RotaEvent.create({ //should find
				objectId:  'e2',
				timestamp: exit,
				location:  'loc1',
				type:      2,
				exited:    false
			});

		var ts = RotaLogService.createRotaTimespan(e1, e2, aRota);

		expect(ts.location).toEqual('loc1');
		expect(ts.rota).toEqual('rota1');
		expect(ts.enter).toBe(enter);
		expect(ts.exit).toBe(exit);
		expect(ts.duration).toBe(150);
	});
	it('.createRotaTimespan returns null if less than min duration', function () {
		var enter = moment('2013-02-08 12:00:00.000').valueOf();
		var exit = moment('2013-02-08 12:15:00.000').valueOf();

		aRota.minimumTime = 30;

		var e1 = RotaEvent.create({ //should find
				objectId:      'e1',
				timestamp: enter,
				location:      'loc1',
				rota:          'rota1',
				type:          1,
				exited:        false,
			}),
			e2 = RotaEvent.create({ //should find
				objectId:  'e2',
				timestamp: exit,
				location:  'loc1',
				type:      2,
				exited:    false
			});

		var ts = RotaLogService.createRotaTimespan(e1, e2, aRota);

		expect(ts).toBeNull();

		expect(e2.error).not.toBe(null);
	});
	
	describe('.createRotaTimespan factors in shift adjustments', function () {
		var enter, exit,
			e1, e2;
		beforeEach(function () {
			enter = moment('2013-02-08 12:00:00.000').valueOf();
			exit = moment('2013-02-08 14:30:00.000').valueOf();
			
			aRota.adjustShiftStart = 10;
			aRota.adjustShiftEnd = 15;
			
			e1 = RotaEvent.create({ //should find
				objectId:  'e1',
				timestamp: enter,
				location:  'loc1',
				rota:      'rota1',
				type:      1,
				exited:    false
			});
			e2 = RotaEvent.create({ //should find
				objectId:  'e2',
				timestamp: exit,
				location:  'loc1',
				type:      2,
				exited:    false
			});
		});
		
		it('can adjust the beginning by 10 and the end by 5', function () {
			var ts = RotaLogService.createRotaTimespan(e1, e2, aRota);
			
			expect(ts.enter).toBe(
				moment('2013-02-08 12:10:00.000').valueOf()
			);
			expect(ts.exit).toBe(
				moment('2013-02-08 14:15:00.000').valueOf()
			);
			expect(ts.duration).toBe(125);
		});
		
	});


	//.calculateDuration
	it('.calculateDuration can calculate the duration and return in minutes', function () {
		var enter = moment('2013-02-08 12:00:00.000').valueOf();
		var exit = moment('2013-02-08 14:20:00.000').valueOf();

		var duration = RotaLogService.calculateDuration(enter, exit);

		expect(duration).toBe(140);
	});
	
	
	describe('createDefaultRotaTimeSpanIfNoEnterEvent', function () {
		var TIME_1, TIME_2, EXIT_EVENT;
		
		beforeEach(function () {
			TIME_1 = moment('2016-02-08 10:00:00.000').valueOf();
			TIME_2 = moment('2016-02-08 18:00:00.000').valueOf();
			EXIT_EVENT = RotaEvent.create({
				timestamp: TIME_2,
				type:      2,
				location:  'loc1'
			});
			
		});
		
		it('creates a rota timespan based on the default shift length', function () {
			aRota.defaultShiftLength = 8;
			
			var ts = RotaLogService.createDefaultRotaTimespanWhenNoEnterEvent(EXIT_EVENT, aRota);
			expect(ts.duration).toBe(8 * 60);
			expect(ts.enter).toBe(TIME_1);
			expect(ts.unresolvedError).toBe(true);
			expect(ts.errorCode).toBe(RotaTimespan.ERROR_CODES.NO_ENTER_EVENT);
		});
		
		it('will adjust the end time but not the start time', function () {
			aRota.defaultShiftLength = 8;
			aRota.adjustShiftEnd = 10;
			aRota.adjustShiftStart = 10;
			
			var ts = RotaLogService.createDefaultRotaTimespanWhenNoEnterEvent(EXIT_EVENT, aRota);
			expect(ts.enter).toBe(TIME_1);
			expect(ts.duration).toBe((8 * 60) - 10);
			
		});
	});
	
	describe('createDefaultRotaTimeSpanIfNoExitEvent', function () {
		var TIME_1, TIME_2, ENTER_EVENT;
		
		beforeEach(function () {
			TIME_1 = moment('2016-02-08 10:00:00.000').valueOf();
			TIME_2 = moment('2016-02-08 18:00:00.000').valueOf();
			ENTER_EVENT = RotaEvent.create({
				timestamp: TIME_1,
				type:      2,
				location:  'loc1'
			});
		});
		
		it('creates a rota timespan based on the default shift length', function () {
			aRota.defaultShiftLength = 8;
			
			var ts = RotaLogService.createDefaultRotaTimespanWhenNoExitEvent(ENTER_EVENT, aRota);
			expect(ts.duration).toBe(8 * 60);
			expect(ts.exit).toBe(TIME_2);
			expect(ts.unresolvedError).toBe(true);
			expect(ts.errorCode).toBe(RotaTimespan.ERROR_CODES.NO_EXIT_EVENT);
		});
		
		it('will adjust the start time but not the end time', function () {
			aRota.defaultShiftLength = 8;
			aRota.adjustShiftEnd = 10;
			aRota.adjustShiftStart = 10;
			
			var ts = RotaLogService.createDefaultRotaTimespanWhenNoExitEvent(ENTER_EVENT, aRota);
			expect(ts.exit).toBe(TIME_2);
			expect(ts.duration).toBe((8 * 60) - 10);
			
		});
	});


	//.receiveNotification
	it('.receiveNotification can receive an enter and exit and create a timespan', function (done) {

		/*
		 * Code to fake the times
		 */
		var TIME_1 = moment('2016-02-08 12:00:00.000').valueOf(),
			TIME_2 = moment('2016-02-08 14:30:00.000').valueOf();

		var FAKE_TIME = TIME_1;
		spyOn(RotaLogService, 'getTimeStamp').and.callFake(function () {
			return FAKE_TIME;
		});

		_up().then(function () {
			/*
			 * Send a create event
			 */
			return RotaLogService.receiveNotification([{
				id:             'unique1',
				transitionType: GEOFENCE_EVENTS.ENTER,
				latitude:       0,
				longitude:      0
			}]);
		}).then(function () {
			//check event has been created
			return RotaEvent.$find();
		}).then(function (events) {
			expect(events.length).toBe(1);
			/*
			 * Send an exit event
			 */
			FAKE_TIME = TIME_2;
			return RotaLogService.receiveNotification([{
				id:             'unique1',
				transitionType: GEOFENCE_EVENTS.EXIT
			}]);
		}).then(function () {
			//check event has been created and one updated
			return RotaEvent.$find();
		}).then(function (events) {
			expect(events.length).toBe(2);
			expect(events[0].timestamp).toBe(TIME_1);
			expect(events[0].exited).toBe(true);
			expect(events[0].type).toBe(GEOFENCE_EVENTS.ENTER);

			expect(events[1].timestamp).toBe(TIME_2);
			expect(events[1].exited).toBe(false);
			expect(events[1].type).toBe(GEOFENCE_EVENTS.EXIT);

			//check that a a timespan has been created
			return RotaTimespan.$find();
		}).then(function (timespans) {
			expect(timespans.length).toBe(1);

			var t = timespans[0];
			expect(t.rota).toBe('rota1');
			expect(t.location).toBe('loc1');
			expect(t.enter).toBe(TIME_1);
			expect(t.exit).toBe(TIME_2);
			expect(t.duration).toBe(150);

			done();
		});

		_d();
	});

	it('.receiveNotification can handle with no found enter event', function (done) {
		
		var TIME_1 = moment('2016-02-08 10:00:00.000').valueOf(),
			TIME_2 = moment('2016-02-08 18:00:00.000').valueOf();
		
		spyOn(RotaLogService, 'getTimeStamp').and.callFake(function () {
			return TIME_2;
		});

		_up().then(function () {
			/*
			 * Send a create event
			 */
			return RotaLogService.receiveNotification([{
				id:             'unique1',
				transitionType: GEOFENCE_EVENTS.EXIT,
				latitude:       0,
				longitude:      0
			}]);
		}).then(function () {
			return RotaEvent.$find();
		}).then(function (events) {
			expect(events.length).toBe(1);
			expect(events.error).not.toBe(null);
			
			return RotaTimespan.$find();
		}).then(function (timespans) {
			/*
			 * should have created a timespan
			 *
			 * It should have an errorCode flag set on it
			 * The shift time should use aRota.defaultShiftLength
			 */
			expect(timespans.length).toBe(1);
			var ts = timespans[0];
			
			expect(ts.duration).toBe(480); //default of 8 hours
			expect(ts.enter).toBe(TIME_1);
			expect(ts.errorCode).toBe(RotaTimespan.ERROR_CODES.NO_ENTER_EVENT);
			expect(ts.unresolvedError).toBe(true);
			done();
		});

		_d();
	});

});