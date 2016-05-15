(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('App', App);

	App.$inject = [
		'DataStore',
		'AuthService',
		'Session',
		'RotaLogService',
		'$q',
		'$rootScope',
		'$ionicLoading',
		'$state',
		'APP_MSG',
		'AUTH_EVENTS'
	];

	/* @ngInject */
	function App(DataStore,
				 AuthService,
				 Session,
				 RotaLogService,
				 $q,
				 $rootScope,
				 $ionicLoading,
				 $state,
				 APP_MSG,
				 AUTH_EVENTS) {

		var self = this;

		self.data = DataStore;
		self.auth = AuthService;
		self.session = Session;
		self.log = RotaLogService;

		self.ready = Session.ready;


		/*
		 *
		 * Start
		 *
		 */
		self.start = function() {
			self.session.start();
		};






		/*
		 *
		 * Authentication Events
		 *
		 */

		/*
		 * Sync on Login
		 */
		$rootScope.$on(AUTH_EVENTS.loginSuccess, function(){
			syncNow(true);
		});

		/*
		 * Clear cache on logout
		 */
		$rootScope.$on(AUTH_EVENTS.logoutSuccess, self.data.clearAll);

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
		});
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
			if (error.code === 3064) {
				$rootScope.$emit(AUTH_EVENTS.notAuthenticated);
			}
		}, 'error');


		/*
		 *
		 *
		 * Function Definitions
		 *
		 *
		 */

		/**
		 * syncNow
		 *
		 *
		 * Performs a sync. If clear is specified then all data is cleared out first
		 *
		 *
		 * @param clear
		 */
		function syncNow(clear) {
			clear = typeof clear !== 'undefined' ? clear : false;

			$ionicLoading.show();

			$q.when().then(function () {
				return clear ?
					DataStore.clearAll() :
					$q.when();

			}).then(function () {
				return DataStore.syncAll()
			}).then(function () {
				$ionicLoading.hide();
			}, function (error) {
				//@TODO Error handling
				throw(error);
			});
		}


	}

})();

