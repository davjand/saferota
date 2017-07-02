describe('saferota.core rotaLogService E2E', function () {
	
	beforeEach(function () {
		bard.appModule('saferota.core');
		bard.inject(
			'RotaLogService',
			'Rota',
			'RotaLocation',
			'$q',
			'$rootScope',
			'moment',
			'DataStore',
			'RequestService',
			'RotaTimespan',
			'RotaEvent',
			'GEOFENCE_EVENTS'
		);
		
		DataStore.$alwaysSearchLocal = true;
		RequestService.$disableBackgroundQueueProcessing = true;
	});
	
	
	/*
	 *
	 *
	 * Helper Functions
	 *
	 *
	 */
	function _d() {
		setTimeout(function ($rootScope) {
			$rootScope.$digest();
		}, 0, $rootScope);
	}
	
	
	/*
	 * helper function to setup the data
	 * Easier to do per unit test than in before due to digest issues
	 *
	 */
	function _up(toSave) {
		return DataStore.clearAll().then(function () {
			return DataStore.save(toSave);
		});
	}
	
	/**
	 * Get all the timespans and events in a hashed array
	 * @returns {*}
	 * @private
	 */
	function _timespansAndEvents() {
		return $q.all({
			timespans: RotaTimespan.$find(),
			events:    RotaEvent.$find()
		});
	}
	
	
	/*
	 *
	 *
	 * Start tests
	 *
	 *
	 */
	
	describe('Multiple Rotas', function () {
		var rota1, rota2,
			location1, location2, location3, location4;
		
		beforeEach(function (done) {
			/*
			 * First rota with 2 locations
			 */
			rota1 = Rota.create({
				objectId:           'rota1',
				adjustShiftStart:   0,
				adjustShiftEnd:     0,
				defaultShiftLength: 8,
				minimumTime:        30
			});
			location1 = RotaLocation.create({
				objectId:         'location1',
				uniqueIdentifier: 'unique1',
				rota:             'rota1'
			});
			location2 = RotaLocation.create({
				objectId:         'location2',
				uniqueIdentifier: 'unique2',
				rota:             'rota1'
			});
			/*
			 * Second rota with 2 locations
			 */
			rota2 = Rota.create({
				objectId:           'rota2',
				adjustShiftStart:   0,
				adjustShiftEnd:     0,
				defaultShiftLength: 8,
				minimumTime:        30
			});
			location3 = RotaLocation.create({
				objectId:         'location3',
				uniqueIdentifier: 'unique3',
				rota:             'rota2'
			});
			location4 = RotaLocation.create({
				objectId:         'location4',
				uniqueIdentifier: 'unique4',
				rota:             'rota2'
			});
			
			_up([rota1, rota2, location1, location2, location3, location4]).then(function () {
				done();
			});
			_d();
		});
		
		it('._findLocationFromUniqueId returns the correct location', function (done) {
			RotaLogService._findLocationFromUniqueId('unique1').then(function (loc) {
				expect(loc.objectId).toBe('location1');
				done();
			});
			_d();
		});
		it('._findLocationFromUniqueId returns the correct location 2', function (done) {
			RotaLogService._findLocationFromUniqueId('unique4').then(function (loc) {
				expect(loc.objectId).toBe('location4');
				done();
			});
			_d();
		});
		
		it('._findRotaFromLocation returns the correct rota', function (done) {
			RotaLogService._findRotaFromLocation(location2).then(function (rota) {
				expect(rota.objectId).toBe('rota1');
				done();
			});
			_d();
		});
		
		it('Shouldnt generate default times when events are recorded normally', function (done) {
			var R = RotaLogService,
				now = moment("2015-12-25").hour(9).minute(0).seconds(0).valueOf(),
				twoHour = moment(now).add(2, 'hours').valueOf(),
				fourHour = moment(now).add(4, 'hours').valueOf(),
				sixHour = moment(now).add(6, 'hours').valueOf(),
				eightHour = moment(now).add(6, 'hours').valueOf(),
				tenHour = moment(now).add(8, 'hours').valueOf();
			
			R.receiveNotification([{
				id: 'unique1',
				transitionType: GEOFENCE_EVENTS.ENTER,
				date: now
			}]).then(function(){
				return R.receiveNotification([{
					id: 'unique1',
					transitionType: GEOFENCE_EVENTS.EXIT,
					date: twoHour
				}]);
			}).then(function(){
				return R.receiveNotification([{
					id: 'unique1',
					transitionType: GEOFENCE_EVENTS.ENTER,
					date: fourHour
				}]);
			}).then(function(){
				return R.receiveNotification([{
					id: 'unique1',
					transitionType: GEOFENCE_EVENTS.EXIT,
					date: sixHour
				}]);
			}).then(function(){
				return R.receiveNotification([{
					id: 'unique1',
					transitionType: GEOFENCE_EVENTS.ENTER,
					date: eightHour
				}]);
			}).then(function(){
				return R.receiveNotification([{
					id: 'unique1',
					transitionType: GEOFENCE_EVENTS.EXIT,
					date: tenHour
				}]);
			}).then(function(){
				return $q.all({
					timespans: RotaTimespan.$find(),
					events:    RotaEvent.$find()
				});
			}).then(function(results){
				
				expect(results.timespans.length).toBe(3);
				expect(results.events.length).toBe(6);
				
				angular.forEach(results.events,function(event){
					expect(event.error).toBe(null);
					if(event.type === GEOFENCE_EVENTS.ENTER){
						expect(event.exited).toBe(true);
					}
				});
				
				done();
			});
			
			_d();
			
		});
		
		
		describe('Process multiple events simultaneously', function () {
			
			it('two enter notifications should create two active events and no timespans', function (done) {
				RotaLogService.receiveNotification([
					{
						id:             'unique1',
						transitionType: GEOFENCE_EVENTS.ENTER
					},
					{
						id:             'unique3',
						transitionType: GEOFENCE_EVENTS.ENTER
					}
				]).then(function () {
					return $q.all({
						timespans: RotaTimespan.$find(),
						events:    RotaEvent.$find()
					});
				}).then(function (results) {
					
					expect(results.timespans.length).toBe(0);
					expect(results.events.length).toBe(2);
					
					expect(results.events[0].exited).toBe(false);
					expect(results.events[1].exited).toBe(false);
					
					done();
				});
				_d();
			});
		});
		
		describe('when multiple enter events in a row', function () {
			var now, oneHour, tenHour;
			beforeEach(function () {
				now = moment("2015-12-25").hour(9).minute(0).seconds(0).valueOf();
				oneHour = moment(now).add(1, 'hours').valueOf();
				tenHour = moment(now).add(10, 'hours').valueOf();
			});
			
			
			it('If difference < averageShiftDuration then deactivate current and use previous', function (done) {
				RotaLogService.receiveNotification([{
					id:             'unique1',
					transitionType: GEOFENCE_EVENTS.ENTER,
					date:           now
				}]).then(function () {
					return RotaLogService.receiveNotification([{
						id:             'unique1',
						transitionType: GEOFENCE_EVENTS.ENTER,
						date:           oneHour
					}]);
				}).then(function () {
					return _timespansAndEvents();
				}).then(function (obj) {
					expect(obj.events.length).toBe(2);
					expect(obj.events[0].exited).toBe(false);
					expect(obj.events[1].exited).toBe(true);
					
					expect(obj.timespans.length).toBe(0);
					done();
				});
				_d();
			});
			it('If difference > averageShiftDuration then create a default shift for the previous and exit', function (done) {
				RotaLogService.receiveNotification([{
					id:             'unique1',
					transitionType: GEOFENCE_EVENTS.ENTER,
					date:           now
				}]).then(function () {
					return RotaLogService.receiveNotification([{
						id:             'unique1',
						transitionType: GEOFENCE_EVENTS.ENTER,
						date:           tenHour
					}]);
				}).then(function () {
					return _timespansAndEvents();
				}).then(function (obj) {
					expect(obj.events.length).toBe(2);
					expect(obj.events[0].exited).toBe(true);
					expect(obj.events[1].exited).toBe(false);
					
					expect(obj.timespans.length).toBe(1);
					var t = obj.timespans[0];
					
					expect(t.duration).toBe(8 * 60);
					done();
				});
				_d();
			});
			
			
		});
		
		
		describe('when multiple exit events in a row ', function () {
			var now, fiveHour, tenHour, twelveHour, twentyHour;
			beforeEach(function () {
				now = moment("2015-12-25").hour(9).minute(0).seconds(0).valueOf();
				fiveHour = moment(now).add(5, 'hours').valueOf();
				tenHour = moment(now).add(10, 'hours').valueOf();
				twelveHour = moment(now).add(12, 'hours').valueOf();
				twentyHour = moment(now).add(20, 'hours').valueOf();
			});
			
			
			it('If no previous timespans then create a default one', function (done) {
				RotaLogService.receiveNotification([{
					id:             'unique1',
					transitionType: GEOFENCE_EVENTS.EXIT,
					date:           now
				}]).then(function () {
					return _timespansAndEvents();
				}).then(function (obj) {
					expect(obj.events.length).toBe(1);
					
					expect(obj.timespans.length).toBe(1);
					
					//should be now -> eightHours
					expect(obj.timespans[0].duration).toBe(8 * 60);
					expect(moment(obj.timespans[0].exit)).toEqual(moment(now));
					
					done();
				});
				_d();
			});
			
			
			it('If the last timespan is > avgShiftDuration then create new one', function (done) {
				RotaLogService.receiveNotification([{
					id:             'unique1',
					transitionType: GEOFENCE_EVENTS.ENTER,
					date:           now
				}]).then(function () {
					return RotaLogService.receiveNotification([{
						id:             'unique1',
						transitionType: GEOFENCE_EVENTS.EXIT,
						date:           fiveHour
					}]);
				}).then(function () {
					return RotaLogService.receiveNotification([{
						id:             'unique1',
						transitionType: GEOFENCE_EVENTS.EXIT,
						date:           twentyHour
					}]);
				}).then(function () {
					return _timespansAndEvents();
				}).then(function (obj) {
					expect(obj.events.length).toBe(3);
					
					expect(obj.timespans.length).toBe(2);
					
					//should be now -> fiveHour
					expect(obj.timespans[0].duration).toBe(5 * 60);
					
					//second one should be twelveHour -> twentyHour
					expect(obj.timespans[1].duration).toBe(8 * 60);
					expect(obj.timespans[1].enter).toBe(twelveHour);
					expect(obj.timespans[1].exit).toBe(twentyHour);
					
					done();
				});
				_d();
			});
			
			
			it('If the last timespan is within the default shift duration then ignore', function (done) {
				RotaLogService.receiveNotification([{
					id:             'unique1',
					transitionType: GEOFENCE_EVENTS.ENTER,
					date:           now
				}]).then(function () {
					return RotaLogService.receiveNotification([{
						id:             'unique1',
						transitionType: GEOFENCE_EVENTS.EXIT,
						date:           fiveHour
					}]);
				}).then(function () {
					return RotaLogService.receiveNotification([{
						id:             'unique1',
						transitionType: GEOFENCE_EVENTS.EXIT,
						date:           tenHour
					}]);
				}).then(function () {
					return _timespansAndEvents();
				}).then(function (obj) {
					expect(obj.events.length).toBe(3);
					
					expect(obj.timespans.length).toBe(1);
					var t = obj.timespans[0];
					
					//should be now -> fiveHour
					expect(t.duration).toBe(5 * 60);
					expect(t.enter).toBe(now);
					expect(t.exit).toBe(fiveHour);
					done();
				});
				_d();
			});
			
			
		});
	});
	
});