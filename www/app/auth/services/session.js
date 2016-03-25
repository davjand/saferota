(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.service('Session', Session);

	Session.$inject = ['User', 'Backendless', '$q'];

	/* @ngInject */
	function Session(User, Backendless, $q) {
		var self = this;

		//Public
		self.isLoggedIn = _isLoggedIn();
		self.user = null;
		self.data = {};

		//ready promise that is resolved when the state is ready
		self._ready = $q.defer();

		//Methods
		self.start = start;
		self.clear = clear;
		self.getReady = getReady;

		//Private, for testing only
		if (window.inject) {
			self._handleDescribeUserClass = _handleDescribeUserClass;
		}


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

			if (_isLoggedIn()) {
				Backendless.UserService.describeUserClass(
					new Backendless.Async(
						_handleDescribeUserClass,
						_handleError));
			}
			else {
				self._ready.reject('Not Logged In');
			}

			return self._ready.promise;
		}

		function clear() {
			this.isLoggedIn = false;
			this.user = null;
			this.data = {};
		}


		/*

		 Private

		 */

		function _isLoggedIn() {
			return Backendless.UserService.getCurrentUser() !== null;
		}

		function _handleDescribeUserClass(data) {
			self.user = new User(data);
			self.isLoggedIn = true;
			self._ready.resolve();
		}

		function _handleError(error) {
			self._ready.reject(error.message);
		}
	}

})();

