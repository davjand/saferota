(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.service('Session', Session);

	Session.$inject = ['User', 'Backand', '$q'];

	/* @ngInject */
	function Session(User, Backand, $q) {
		var self = this;

		//Public
		self.isLoggedIn = Backand.getUsername() !== null;
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
		function getReady(){
			if(self._ready === true){
				return true;
			}else{
				return self._ready.promise;
			}
		}

		/*

		 Start a session

		 Returns a promise for when the user details have been got


		 */
		function start() {
			if (self._ready === true) {
				self._ready = $q.defer();
			}


			Backand.getUserDetails()
				.then(function (data) {
					self.user = new User(data);
					self.isLoggedIn = true;
					self._ready.resolve();
					self._ready = true;
				}, function (r) {
					self._ready.reject(r);
				});

			return self._ready.promise;
		}

		function clear() {
			this.isLoggedIn = false;
			this.user = null;
			this.data = {};
		}
	}

})();

