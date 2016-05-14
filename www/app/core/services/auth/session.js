(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('Session', Session);

	Session.$inject = ['$injector', 'Backendless', '$q', '$rootScope', 'CacheFactory'];

	/* @ngInject */
	function Session($injector, Backendless, $q, $rootScope, CacheFactory) {
		var self = this;
		var $s = $rootScope.$new();

		//Public
		self.isLoggedIn = false;
		self.user = {};
		self.userId = null;
		self.data = {};

		//ready promise that is resolved when the state is ready
		self._ready = $q.defer();

		//Methods
		self.start = start;
		self.clear = clear;
		self.getReady = getReady;

		self.isValidLoginToken = isValidLoginToken;

		///////////////////////////////

		/*

		 getReady

		 */
		function getReady() {
			return self._ready.promise;
		}

		/*

		 Start a session

		 Returns a promise for when the user details have been got


		 */
		function start(userId) {
			self._ready = $q.defer();

			/*
			 * Allow userId to be passed in (ie from login functions etc)
			 *
			 * Cache if passed, if not passed, try to get from the cache
			 * (we can't trust backendless as has bugs)
			 *
			 */
			if (userId) {
				_cacheUserId(userId);
			} else {
				userId = _getCachedUserId();
				if (!userId) {
					self._ready.resolve();
					return;
				}
			}
			self.userId = userId;


			self.isValidLoginToken().then(function (result) {
				if (result) {
					//use the injector to prevent dependency issues
					var User = $injector.get('User');

					self.isLoggedIn = true;

					return User.$get(userId, $s).then(function (user) {
						if (user) {
							return $q.when(user);
						} else {
							return User.$get(userId, $s, true);
						}
					}).then(function (user) {
						self.user = user;
						self._ready.resolve();
					})
				} else {
					self._ready.resolve();
				}
			});

			return self._ready.promise;
		}

		/**
		 * clear
		 *
		 * Clears the Data
		 *
		 */
		function clear() {
			self.isLoggedIn = false;
			self.user = null;
			self.data = {};
		}


		/**
		 * isValidLoginToken
		 *
		 * Wraps the backendless isValidLogin function
		 *
		 * @returns {Promise} Resolves to Boolean
		 */
		function isValidLoginToken() {
			var p = $q.defer();

			if (Backendless.LocalCache.get("user-token")) {
				Backendless.UserService.isValidLogin(
					new Backendless.Async(
						function (result) {
							p.resolve(true);
						}, function (error) {
							p.resolve(false);
						})
				)
			} else {
				p.resolve(false);
			}
			return p.promise;
		}


		/*

		 Private

		 */

		/**
		 * _cacheUserId
		 *
		 * Caches the user id (we can't trust backendless)
		 *
		 * @param id
		 * @private
		 */
		function _cacheUserId(id) {
			var cache = _cache();

			cache.put('user', id);
		}

		/**
		 * _getCacheUserId
		 *
		 * Get the user id from cache
		 *
		 * @returns {*}
		 * @private
		 */
		function _getCachedUserId() {
			var cache = _cache();
			return cache.get('user');
		}


		/**
		 * _cache
		 *
		 * get (create if needed) a cache
		 *
		 * @private
		 */
		function _cache() {
			var CACHE_NAME = 'authService';
			if (!CacheFactory.get(CACHE_NAME)) {
				CacheFactory.createCache(CACHE_NAME, {
					storageMode: 'localStorage'
				});
			}
			return CacheFactory.get(CACHE_NAME);
		}


	}

})
();

