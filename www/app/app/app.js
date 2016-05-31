(function () {
	'use strict';

	angular
		.module('saferota.app')
		.service('App', App);

	App.$inject = [
		'DataStore',
		'AuthService',
		'Session',
		'RotaLogService',
		'TourService',
		'$q',
		'$rootScope',
		'Loading',
		'$ionicHistory',
		'$state',
		'Cache',
		'RotaGeoFenceService',
		'APP_MSG',
		'AUTH_EVENTS'
	];

	/* @ngInject */
	function App(DataStore,
				 AuthService,
				 Session,
				 RotaLogService,
				 TourService,
				 $q,
				 $rootScope,
				 Loading,
				 $ionicHistory,
				 $state,
				 Cache,
				 RotaGeoFenceService,
				 APP_MSG,
				 AUTH_EVENTS) {

		var self = this;

		self.data = DataStore;
		self.auth = AuthService;
		self.session = Session;
		self.log = RotaLogService;
		self.cache = Cache;
		self.tour = TourService;

		self.ready = function () {
			return Session.ready();
		};


		/*
		 *
		 * Start Session / Bootstrap
		 *
		 */
		self.start = function () {
			self.session.start();
		};
		
		
		activate();


		/*
		 *
		 *
		 * 
		 * 
		 * Function Definitions
		 *
		 * 
		 * 
		 *
		 */
		
		
		function activate() {
			
			/*
			 *
			 * Tour
			 *
			 *
			 */
			self.tour.showIfFirstTime();
			
			
			/*
			 *
			 * Authentication Events
			 T			 *
			 */
			
			
			/*
			 * Sync on Login
			 */
			$rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
				syncNow(true, true)
					.then(function () {
							$ionicHistory.nextViewOptions({historyRoot: true, disableAnimate: true});
							$state
								.go('app.list');
						}
					)
			});
			/*
			 * Clear cache on logout
			 */
			$rootScope.$on(AUTH_EVENTS.logoutSuccess, function () {
				RotaGeoFenceService.deactivateAll().then(function () {
					self.data.clearAll();
				})
			});
			/*
			 * Go to login if has expired
			 */
			$rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
				$state.go('auth.login');
			});
			
			
			/*
			 *
			 * Sync Events
			 *
			 */
			$rootScope.$on(APP_MSG.SYNC_FRESH, function () {
				syncNow(true);
			})
			;
			$rootScope.$on(APP_MSG.SYNC_NOW, function () {
				syncNow(false);
			});
			
			
			/*
			 *
			 * Error Handling
			 *
			 */
			
			
			/*
			 * Handle DataStore Errors
			 */
			DataStore.interceptor(function (error) {
				error = error || {};
				if (
					error.code === 3064) {
					$rootScope.$emit(AUTH_EVENTS.notAuthenticated);
				}
			}, 'error');
		}


		/**
		 * syncNow
		 *
		 *
		 * Performs a sync. If clear is specified then all data is cleared out first
		 *
		 *
		 * @param clear
		 */
		function syncNow(clear, isFirstSync) {
			clear = typeof clear !== 'undefined' ? clear : false;
			isFirstSync = typeof isFirstSync !== 'undefined' ? isFirstSync : false;
			
			if (isFirstSync) {
				Loading.show('Performing first setup,<br/>please be patient');
			}
			else {
				Loading.show('Synchronising,<br/>please be patient');
			}

			return $q.when().then(function () {
				return clear ?
					DataStore.clearAll() :
					$q.when();

			}).then(function () {
				//noinspection JSUnresolvedFunction
				return DataStore.syncAll()
			}).then(function () {
				Loading.hide();
				return $q.when();
			}, function (error) {
				//@TODO Error handling
				throw(error);
			});
		}


	}

})();

