(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('Session', Session);

	Session.$inject = [
		'$injector',
		'Backendless',
		'$q',
		'$rootScope',
		'CacheFactory',
		'$log',
		'AUTH_EVENTS'];

	/* @ngInject */
	function Session(	$injector,
						 Backendless,
						 $q,
						 $rootScope,
						 CacheFactory,
						 $log,
						 AUTH_EVENTS) {

		var self = this;
		var $s = $rootScope.$new();

		//Public
		self.isLoggedIn = false;
		self.user = {};
		self.userId = null;

		//ready promise that is resolved when the state is ready
		self._ready = $q.defer();

		//Methods
		self.start = start;
		self.clear = clear;
		self.ready = ready;

		self.isValidLoginToken = isValidLoginToken;
		self.notAuthenticated = notAuthenticated;

		///////////////////////////////


		/**
		 * ready
		 *
		 * Returns a promise to whether or not the session
		 * has been initialized
		 *
		 * @returns {Function}
		 */
		function ready() {
			return self._ready.promise;
		}


		/**
		 * start
		 *
		 * Starts a session. Can optionally be passed a user Id
		 *
		 * UserId is cached locally.
		 *
		 * If userId is present and a token is present, we assume that we're logged in
		 *
		 * In the background, validation will occur. If this fails, a not authorized event is
		 * fired and the session updated
		 *
		 *
		 * @param userId
		 * @returns {Promise}
		 */
		function start(userId) {

			//self._ready = $q.defer();

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
					_setReady();
					return self._ready.promise;
				}
			}
			self.userId = userId;

			/*
			 * get the token - if one exists we can assume that it is
			 * valid unless forced by the above
			 */
			var token = Backendless.LocalCache.get("user-token");

			//use the injector to prevent dependency issues
			var User = $injector.get('User');

			/*
			 * Find the user object and store in memory
			 */

			//assume logged in until proven otherwise
			if(userId && token) {
				self.isLoggedIn = true;
			}

			User.$get(userId, $s).then(function (user) {

				if (user && token) {
					self.user = user;
					self.isLoggedIn = true;
				}else{
					self.isLoggedIn = false;
				}

				/*
				 * validate the login in the background
				 */
				self.isValidLoginToken().then(function(valid){
					if (valid === false) {
						self.notAuthenticated();
					}
				});

				_setReady();
			},function(error){
				self.notAuthenticated(error);
				_setReady();
			});


			return self.ready();
		}

		/**
		 * notAuthenticated
		 *
		 * Logs an error, clears the session and emits
		 * a not authenticated event
		 *
		 * @param error
		 */
		function notAuthenticated(error){
			if(error){
				$log.log(error);
			}
			self.clear();
			$rootScope.$emit(AUTH_EVENTS.notAuthenticated);
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
			self.userId = null;
			_cacheUserId(self.userId);
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
							p.resolve(result);
						}, function () {
							//might be offline
							p.resolve();
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
		 * setReady
		 */
		function _setReady() {
			if (self._ready.resolve) {
				self._ready.resolve();
			}
		}

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

