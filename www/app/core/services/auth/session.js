(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('Session', Session);

	Session.$inject = ['User', 'Backendless', '$q'];

	/* @ngInject */
	function Session(User, Backendless, $q) {
		var self = this;

		//Public
		self.isLoggedIn = false;
		self.user = null;
		self.data = {};

		//ready promise that is resolved when the state is ready
		self._ready = $q.defer();

		//Methods
		self.start = start;
		self.clear = clear;
		self.getReady = getReady;

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
		function start() {
			self._ready = $q.defer();


			var user = _isLoggedIn();

			if (_isLoggedIn() !== false) {
				var userId = Backendless.LocalCache.get("current-user-id");
				self.user = new User({objectId: userId});
				self.isLoggedIn = true;
				self._ready.resolve();
			}
			else {
				self._ready.resolve();
			}

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


		/*

		 Private

		 */

		/**
		 * Gets the current user
		 *
		 *
		 * @returns {* | User}
		 * @private
		 */
		function _isLoggedIn() {
			try {
				/*
				 A bit of a hack to prevent going online syncrhonously every single page load
				 @TODO will need reviewing
				 return Backendless.UserService.getCurrentUser();
				 */
				return Backendless.LocalCache.get("current-user-id") != false
			} catch (error) {
				return false;
			}
		}
	}

})();

