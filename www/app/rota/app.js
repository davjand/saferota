(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.controller('AppController', AppController);

	/**
	 * AppController
	 *
	 * Main functionality is to listen to authservice events
	 *
	 * Triggers a sync when login (showing a loading ui)
	 *
	 * Triggers a sync every minute (not showing the loading ui)
	 *
	 */

	AppController.$inject = [
		'$ionicLoading',
		'$rootScope',
		'$q',
		'$timeout',
		'DataStore',
		'AUTH_EVENTS',
		'DATA_EVENTS'
	];

	/* @ngInject */
	function AppController($ionicLoading,
						   $rootScope,
						   $q,
						   $timeout,
						   DataStore,
						   AUTH_EVENTS,
						   DATA_EVENTS) {
		var vm = this;

		var syncPromise = null,
			SYNC_EVERY = 1000 * 60 * 4; //4 minutes

		activate();

		////////////////

		function activate() {

			/*
			 * When login, perform a data sync and block data input initially
			 *
			 * If successful, the schedule a sync every 60 seconds
			 *
			 */
			$rootScope.$on(AUTH_EVENTS.loginSuccess, doSync);

			/*
			 * When a refresh data event is triggered
			 * do a complete resync.
			 */
			$rootScope.$on(DATA_EVENTS.REFRESH_DATA, function () {
				doSync(true);
			});

			/*
			 * Clear cache on logout
			 */
			$rootScope.$on(AUTH_EVENTS.logoutSuccess, logout);

			/*
			 * Handle DataStore Errors
			 */
			DataStore.interceptor(function (error) {
				if (error.code === 3064) {
					console.log('logout');
				}
			}, 'error');

		}

		/**
		 * doSync
		 *
		 * Performs a sync
		 *
		 * @param clear {Boolean} - Optional. Pass true to clear all client data
		 */
		function doSync(clear) {
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
				$rootScope.$emit(DATA_EVENTS.SYNC_COMPLETE);
				scheduleSync();
			}, function (error) {
				//@TODO Error handling
				throw(error);
			});
		}


		/**
		 * logout
		 *
		 * Clear all data on logout.
		 *
		 */
		function logout() {
			DataStore.clearAll();
		}


		/**
		 * scheduleSync
		 *
		 * Schedules a sync to run every SYNC_EVERY seconds
		 *
		 */
		function scheduleSync() {
			if (!syncPromise) {
				syncPromise = $timeout(function () {
					DataStore.syncAll().then(function () {
						syncPromise = null;
						scheduleSync();
					}, function (error) {
						//@TODO Error handling
						throw(error);
					})
				}, SYNC_EVERY);
			}
		}
	}

})();

