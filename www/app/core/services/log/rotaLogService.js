(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.constant('GEOFENCE_EVENTS', {
			ENTER: 1,
			EXIT:  2,
			BOTH:  3
		})
		.service('RotaLogService', RotaLogService);
	
	RotaLogService.$inject = [
		'RotaLocation',
		'Rota',
		'RotaEvent',
		'RotaTimespan',
		'$rootScope',
		'DataStore',
		'$q',
		'moment',
		'GEOFENCE_EVENTS'
	];
	
	/* @ngInject */
	function RotaLogService(RotaLocation,
							Rota,
							RotaEvent,
							RotaTimespan,
							$rootScope,
							DataStore,
							$q,
							moment,
							GEOFENCE_EVENTS) {
		var self = this;
		
		var $s = $rootScope.$new();
		
		/*
		 * Module Definition
		 */
		self.receiveNotification = receiveNotification;
		
		self.createRotaEvent = createRotaEvent;
		
		self.findEnterEvents = findEnterEvents;
		self.findExitEvents = findExitEvents;
		self.findTimespans = findTimespans;
		
		self.createRotaTimespan = createRotaTimespan;
		self.calculateDuration = calculateDuration;
		self.getTimeStamp = getTimeStamp;
		
		self.createDefaultRotaTimespanWhenNoEnterEvent = createDefaultRotaTimespanWhenNoEnterEvent;
		self.createDefaultRotaTimespanWhenNoExitEvent = createDefaultRotaTimespanWhenNoExitEvent;
		
		/*
		 * Private Functions
		 */
		self._findLocationFromUniqueId = _findLocationFromUniqueId;
		self._findRotaFromLocation = _findRotaFromLocation;
		
		
		$rootScope.$on('GEO_EVENT', function ($event, data) {
			self.receiveNotification(data);
		});
		
		
		/*
		 *
		 *
		 * Function Definitions
		 *
		 *
		 *
		 */
		
		
		/**
		 * Lookup the location from the geofence id
		 *
		 * @param uniqueId
		 * @returns {*}
		 * @private
		 */
		function _findLocationFromUniqueId(uniqueId) {
			return RotaLocation.$find({filter: {uniqueIdentifier: uniqueId}}).then(function (locations) {
				if (locations.length < 1) {
					return null;
				}
				return locations[0];
			})
		}
		
		/**
		 * get the rota from the location
		 *
		 * @param location
		 * @private
		 */
		function _findRotaFromLocation(location) {
			return location.$getRel('rota');
		}
		
		
		/**
		 * recieveNotification
		 *
		 * Function to receive notifications from the geofence plugin
		 * Expects data in the following format
		 * geofences: Array[
		 *   {
		 *     id: ''
		 *     transitionType: ' GENFENCE_EVENTS {ENTER|EXIT}
		 *     latitude
		 *     longitude
		 *   }
		 * ]
		 *
		 * It
		 *  - creates an rotaEvent
		 *  - if an exit event, creates the corresponding timespan
		 *
		 *
		 * @param geofences {Array}
		 * @returns {*}
		 */
		function receiveNotification(geofences) {
			
			geofences = geofences || [];
			if (!angular.isArray(geofences)) {
				geofences = [geofences];
			}
			
			/*
			 * Process sequentially
			 */
			function process(i) {
				i = i || 0;
				
				
				function processNext() {
					$s.$destroy();
					$s = $rootScope.$new();
					return process(i + 1);
				}
				
				
				if (i >= geofences.length) {
					//reset the scope
					$s.$destroy();
					$s = $rootScope.$new();
					return $q.when();
				}
				var fence = geofences[i];
				
				var event,
					rota,
					location,
					toSave = [],
					enterEvents;
				
				//Prevent progression at this stage
				if (!fence.id) {
					return processNext();
				}
				
				/*
				 * Get the location
				 */
				return self._findLocationFromUniqueId(fence.id).then(function (loc) {
					
					location = loc;
					event = self.createRotaEvent(fence, location);
					
					/*
					 * If no location, log the error then throw error via reject
					 */
					if (loc === null) {
						return event.$save().then(function () {
							return $q.reject();
						});
					}
					
					return self._findRotaFromLocation(location);
				}).then(function (foundRota) {
					rota = foundRota;
					
					/*
					 * find any previous enter events for processing
					 */
					return self.findEnterEvents(event);
				}).then(function (ee) {
					enterEvents = ee;
					
					/*
					 * Queue everything for saving
					 */
					toSave.push(event);
					toSave = toSave.concat(enterEvents);
					
					
					if (event.type === GEOFENCE_EVENTS.EXIT) {
						
						
						if (enterEvents !== null && enterEvents.length > 0) {
							
							/*
							 * Create the timespan form the last enter event
							 */
							var lastEnterEvent = enterEvents.shift();
							lastEnterEvent.exited = true;
							toSave.push(
								self.createRotaTimespan(lastEnterEvent, event, rota)
							);
							
							/*
							 * if any remaining events then flag these as errors
							 *
							 * LEGACY CODE - this should not occur as they should be picked up
							 * by the new processing code below for enter events
							 */
							angular.forEach(enterEvents, function (processEvent) {
								processEvent.exited = true;
								processEvent.error = 'No Exit Event found';
							});
						} else {
							
							
							/*
							 *receiveNotification
							 * No Enter Event Found, create default and flag up error
							 *
							 */
							return self.findTimespans(event).then(function (timespans) {
								if (timespans.length < 1) {
									toSave.push(
										self.createDefaultRotaTimespanWhenNoEnterEvent(event, rota)
									);
									event.error = 'No Enter Event: default created';
								} else {
									var lastTimespan = timespans.shift();
									var durationSince = moment(event.timestamp).diff(lastTimespan.exit, 'minutes');
									
									if (durationSince > rota.defaultShiftLength * 60) {
										toSave.push(
											self.createDefaultRotaTimespanWhenNoEnterEvent(event, rota)
										);
										event.error = 'No Enter Event: Default Created';
									} else {
										event.error = 'No Enter Event: Timespan < ' + rota.defaultShiftLength + ' mins ago';
									}
									
									return $q.when(null);
								}
							});
							
							
						}
						
					} else if (event.type === GEOFENCE_EVENTS.ENTER) {
						/*
						 * Enter event processing
						 */
						
						//find any previous enter events
						if (enterEvents.length === 0) {
							return $q.when();
						}
						
						/*
						 * ProcessErrors
						 */
						var lastEvent = enterEvents.shift();
						
						/*
						 * If any have slipped through the net, remove them
						 */
						angular.forEach(enterEvents, function (item) {
							item.exited = true;
							item.error = 'No Exit Event: Deactivated at: ' + moment().format();
						});
						
						//see what the difference between the last event and current event was
						var duration = moment(event.timestamp).diff(lastEvent.timestamp, 'minutes');
						
						if (duration < rota.defaultShiftLength * 60) {
							event.exited = true;
							event.error = "No Exit Event: Entered within last: " + rota.minimumTime + " mins";
						} else {
							toSave.push(
								self.createDefaultRotaTimespanWhenNoExitEvent(lastEvent, rota)
							);
							lastEvent.exited = true;
							lastEvent.error = "No Exit Event: Not Entered within last: " + rota.minimumTime + " mins (default created)";
						}
						
						return $q.when();
					} else {
						//BOTH - nothing to do.
						
					}
					
					
				}).then(function () {
					/*
					 * Save the models
					 */
					return DataStore.save(toSave);
				}).then(function () {
					/*
					 * Process Next
					 */
					return processNext();
				}, function () {
					/*
					 * Catch errors and process next
					 */
					return processNext();
				});
			}
			
			return process();
		}
		
		
		/**
		 *
		 * create a timespan when an enter event has been missed
		 *
		 * @param event
		 * @param rota
		 * @returns {*}
		 */
		function createDefaultRotaTimespanWhenNoEnterEvent(event, rota) {
			
			var estimatedEnterTime = moment(event.timestamp).subtract(rota.defaultShiftLength || 8, 'h');
			
			var timespan = self.createRotaTimespan(
				RotaEvent.create({timestamp: estimatedEnterTime.valueOf()}),
				event,
				rota,
				false, true
			);
			
			//Flag as Error
			timespan.unresolvedError = true;
			timespan.errorCode = RotaTimespan.ERROR_CODES.NO_ENTER_EVENT;
			
			return timespan;
		}
		
		/**
		 *
		 * create a timespan when an exit event has been missed
		 *
		 * @param event
		 * @param rota
		 * @returns {*}
		 */
		function createDefaultRotaTimespanWhenNoExitEvent(event, rota) {
			var estimatedEnterTime = moment(event.timestamp).add(rota.defaultShiftLength || 8, 'h');
			
			var timespan = self.createRotaTimespan(
				event,
				RotaEvent.create({timestamp: estimatedEnterTime.valueOf()}),
				rota,
				true, false
			);
			
			//Flag as Error
			timespan.unresolvedError = true;
			timespan.errorCode = RotaTimespan.ERROR_CODES.NO_EXIT_EVENT;
			
			return timespan;
		}
		
		
		/**
		 * createRotaEvent
		 *
		 * Creates a rotaevent from a passed geofence object
		 *
		 * @param geofence
		 * @param location
		 * @returns {*}
		 */
		function createRotaEvent(geofence, location) {
			location = typeof location !== 'undefined' ? location : null;
			
			/*
			 * Apply the current timestamp if not already set by the system
			 */
			var date = typeof geofence.date !== 'undefined' ?
				moment(geofence.date).valueOf() :
				self.getTimeStamp();
			
			
			var event = RotaEvent.create({
				timestamp: date,
				rota:      null,
				location:  null,
				exited:    false,
				type:      geofence.transitionType
			}, $s);
			
			if (location !== null) {
				event.location = location.getKey();
				event.rota = location.rota;
			} else {
				event.error = 'Could not find location with identifier: ' + geofence.id;
			}
			return event;
		}
		
		
		/**
		 * findEnterEvents
		 *
		 * finds the relevent enter event(s) for the given exit event
		 * Searchs for events that match:
		 *  - the id,
		 *  - are enter events
		 *  - have not been exited
		 *
		 * @param event
		 * @returns {*}
		 */
		function findEnterEvents(event) {
			return RotaEvent.$find({
				filter:  {
					location: event.location,
					type:     GEOFENCE_EVENTS.ENTER,
					exited:   false
				},
				orderBy: '-timestamp'
			}, $s);
		}
		
		
		function findExitEvents(event) {
			return RotaEvent.$find({
				filter:  {
					location: event.location,
					type:     GEOFENCE_EVENTS.EXIT
				},
				orderBy: '-timestamp'
			}, $s);
		}
		
		/**
		 * findTimespans
		 * @param event
		 */
		function findTimespans(event) {
			return RotaTimespan.$find({
				filter:  {
					location: event.location,
				},
				orderBy: '-enter'
			}, $s);
		}
		
		
		/**
		 * createRotaTimespan
		 *
		 * Creates a timespan object
		 *
		 * Uses the rota.minimumtTime to determine if to create an object
		 * Returns null if the duration is < min time
		 *
		 * @param enter
		 * @param exit
		 * @param rota
		 *
		 * @param adjustStart Optional - Defaults True
		 * @param adjustEnd Optional - Defaults True
		 *
		 * @returns {*}
		 */
		function createRotaTimespan(enter, exit, rota, adjustStart, adjustEnd) {
			
			adjustStart = typeof adjustStart !== 'undefined' ? adjustStart : true;
			adjustEnd = typeof adjustEnd !== 'undefined' ? adjustEnd : true;
			
			var enterTime = enter.timestamp,
				exitTime = exit.timestamp;
			
			//adjust enter and exit if needed
			if (rota.adjustShiftStart && rota.adjustShiftStart > 0 && adjustStart) {
				enterTime = moment(enterTime).add(parseFloat(rota.adjustShiftStart), 'm').valueOf();
			}
			if (rota.adjustShiftEnd && rota.adjustShiftEnd > 0 && adjustEnd) {
				exitTime = moment(exitTime).subtract(parseFloat(rota.adjustShiftEnd), 'm').valueOf();
			}
			
			var duration = self.calculateDuration(enterTime, exitTime);
			var min = rota.minimumTime || 0;
			
			if (duration < min) {
				
				//if subtraction has occurred, tidy up for output formatting.
				if (duration < 0) {
					duration = 0;
				}
				exit.error = 'Duration ' + Math.round(duration) + ' mins, less than minimum of ' + min;
				return null;
			}
			
			return RotaTimespan.create({
				location: enter.location,
				rota:     enter.rota,
				enter:    enterTime,
				exit:     exitTime,
				duration: duration
			}, $s);
		}
		
		/**
		 * calculateDuration
		 *
		 * Calculates a duration in minutes from two unix timestamps
		 *
		 * @param enter
		 * @param exit
		 * @returns {number}
		 */
		function calculateDuration(enter, exit) {
			return moment
				.duration(moment(exit).diff(enter))
				.as('minutes');
		}
		
		/**
		 * getTimeStamp
		 *
		 * Returns the current timestamp
		 *
		 * Useful mainly for testing purposes
		 */
		function getTimeStamp() {
			return Date.now();
		}
		
		
	}
	
})();

