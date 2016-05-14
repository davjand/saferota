(function () {
	'use strict';

	angular
		.module('saferota.rota-log')
		.constant('GEOFENCE_EVENTS', {
			ENTER: 1,
			EXIT: 2,
			BOTH: 3
		})
		.service('RotaLogService', RotaLogService);

	RotaLogService.$inject = [
		'RotaLocation',
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
							RotaEvent,
							RotaTimespan,
							$rootScope,
							DataStore,
							$q,
							moment,
							GEOFENCE_EVENTS) {
		var self = this;

		var $s;

		/*
		 * Module Definition
		 */
		self.receiveNotification = receiveNotification;

		self.createRotaEvent = createRotaEvent;
		self.findEnterEvents = findEnterEvents;
		self.processEnterEvents = processEnterEvents;
		self.createRotaTimespan = createRotaTimespan;
		self.calculateDuration = calculateDuration;
		self.getTimeStamp = getTimeStamp;


		$rootScope.$on('GEO_EVENT', function (data) {
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
		 * recieveNotification
		 *
		 * Function to receive notifications from the geofence plugin
		 * Expects data in the following format
		 * geofences: Array[
		 *   {
		 *     id: ''
		 *     type: ' GENFENCE_EVENTS {ENTER|EXIT}
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

			$s = $rootScope.$new();

			geofences = geofences || [];
			if (!angular.isArray(geofences)) {
				geofences = [geofences];
			}

			function process(i) {
				i = i || 0;

				if (i >= geofences.length) {
					return $q.when();
				}
				var fence = geofences[i];

				var event,
					toSave = [];


				/*
				 * Create the event
				 */
				return createRotaEvent(fence).then(function (ev) {
					event = ev;
					toSave.push(event);


					/*
					 * If Exit Event
					 *  - Process Previous
					 *  - Create timespan
					 */
					if (event.type === GEOFENCE_EVENTS.EXIT) {
						/*
						 * Find and process previous enter event(s)
						 * Multiple if error
						 */
						return self.findEnterEvents(event).then(function (enterEvents) {
							if (enterEvents === null || enterEvents.length < 1) {
								event.error = 'Cannot find matching enter event';
								return $q.when(null);
							}

							toSave = toSave.concat(enterEvents);
							return processEnterEvents(enterEvents)
						}).then(function (thisEnterEvent) {

							/*
							 * create timespan object
							 */
							if (thisEnterEvent !== null) {
								var timespan = self.createRotaTimespan(thisEnterEvent, event);
								toSave.push(timespan);
							}

							//Save and clear the models
							return DataStore.save(toSave).then(function () {
								$s.$destroy();
								$s = $rootScope.$new();
								return $q.when();
							});
						}).then(function () {
							return process(i + 1);
						})
					} else {
						//Save and clear the models
						return DataStore.save(toSave).then(function () {
							$s.$destroy();
							$s = $rootScope.$new();
							return $q.when();
						});
					}

				});
			}

			return process();
		}

		/**
		 * createRotaEvent
		 *
		 * Creates a rotaevent from a passed geofence object
		 *
		 * @param geofence
		 * @returns {*}
		 */
		function createRotaEvent(geofence) {
			return RotaLocation.$get(geofence.id).then(function (location) {
				var event = RotaEvent.create({
					timestamp: self.getTimeStamp(),
					rota: null,
					location: null,
					exited: false,
					type: geofence.type
				}, $s);

				if (location) {
					event.location = location.getKey();
					event.rota = location.rota;
				} else {
					event.error = 'Could not find location with ID: ' + geofence.id;
				}
				return $q.when(event);
			});
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
				filter: {
					location: event.location,
					type: GEOFENCE_EVENTS.ENTER,
					exited: false
				},
				orderBy: '-timestamp'
			}, $s);
		}

		/**
		 * processEnterEvents
		 *
		 * Takes the found enter events and processes them
		 * Returns the correct event
		 *
		 * If > 1 then records errors in all the proceeding events
		 *
		 *
		 * @param enterEvents
		 */
		function processEnterEvents(enterEvents) {
			var event;

			if (enterEvents.length < 1) {
				return null;
			}
			else {
				event = enterEvents.shift();
				event.exited = true;

				/*
				 * if any remaining events then flag these as errors
				 */
				angular.forEach(enterEvents, function (item) {
					item.exited = true;
					item.error = 'No Exit Event found, exited at: ' + moment().format();
				});
				return event;
			}
		}


		/**
		 * createRotaTimespan
		 *
		 * Creates a timespan object
		 *
		 * @param enter
		 * @param exit
		 * @returns {*}
		 */
		function createRotaTimespan(enter, exit) {
			return RotaTimespan.create({
				location: enter.location,
				rota: enter.rota,
				enter: enter.timestamp,
				exit: exit.timestamp,
				duration: self.calculateDuration(enter.timestamp, exit.timestamp)
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
