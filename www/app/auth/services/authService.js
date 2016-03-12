(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.service('AuthService', AuthService);

	AuthService.$inject = ['Backand','Session', '$q','$rootScope', 'AUTH_EVENTS'];

	/* @ngInject */
	function AuthService(Backand, Session, $q, $rootScope, AUTH_EVENTS) {
		var self = this;

		//Public
		self.login = login;
		self.signup = signup;
		self.logout = logout;
		self.resetPassword = resetPassword;

		//Private
		self._parseName = _parseName;

		activate();

		////////////////

		function activate() {

			if (Backand.getUsername() !== null) {
				//start a session
				Session.start();
			}


		}

		/*

		 Login Function

		 Logs the user in with email / password + starts a session


		 Returns a promise which resolves / rejects


		 */
		function login(email, password) {
			var p = $q.defer();

			Backand.signin(email, password)
				.then(function () {
					//start the session
					return Session.start();
				}).then(function () {
					//success
					p.resolve();
					$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				},
				//Error
				function (r) {
					p.reject(_errMsg(r));
				});
			return p.promise;
		}

		/*

		 Signup Function

		 Returns a promise that resolves with nothing or rejects with the error message

		 */
		function signup(name, email, password) {
			var p = $q.defer();

			name = _parseName(name);

			Backand.signup(name.first, name.last, email, password, password)
				.then(function(){
					//signin
					return Backand.signin(email,password);
				})
				.then(function () {
					//start the session
					return Session.start();
				}).then(function () {
					//success
					p.resolve();
					$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				},
				//Error
				function (r) {
					p.reject(_errMsg(r));
				});
			return p.promise;
		}

		/*

		Reset a password

		Returns a promise

		 */
		function resetPassword(email){
			var p = $q.defer();
			Backand.requestResetPassword(email)
				.then(function(){
					p.resolve();
				},function(r){
					p.reject(_errMsg(r));
				});
			return p.promise;
		}



		/*

		Sign Out

		 */
		function logout(){
			var p = $q.defer();
			Backand.signout().then(function(){
				Session.clear();
				$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
				p.resolve();
			},function(error){
				p.reject(error);
			});

			return p.promise;

		}

		/*

		 Parses a name into a first name and last name

		 */
		function _parseName(name) {

			var result = {
				first: '',
				last: ''
			};

			if (name.indexOf(' ') === -1) {
				result.first = name;
				return result;
			}

			var s = name.split(' ');

			if (s.length === 2) {
				result.first = s[0];
				result.last = s[1];
			} else {
				result.first = s[0];
				s.shift();
				result.last = s.join(' ');
			}
			return result;
		}

		/*

		 Returns an error message from a Backand response

		 */
		function _errMsg(r) {
			var data = r.data || r;
			return data.error_description ? data.error_description : data;
		}


	}

})();

