(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('AuthService', AuthService);

	AuthService.$inject = ['Backendless','Session', '$q','$rootScope', 'AUTH_EVENTS'];

	/* @ngInject */
	function AuthService(Backendless, Session, $q, $rootScope, AUTH_EVENTS) {
		var self = this;

		//Public
		self.getSession = getSession;
		self.isReady = isReady;
		
		self.login = login;
		self.signup = signup;
		self.logout = logout;
		self.resetPassword = resetPassword;

		//Private
		self._parseName = _parseName;

		activate();

		////////////////

		function activate() {

			Session.start();
		}

		/**
		 * getSession
		 *
		 * Returns the current session
		 * @returns {*}
		 */
		function getSession() {
			return Session;
		}

		function isReady() {
			return Session.getReady();
		}


		/*

		 Login Function

		 Logs the user in with email / password + starts a session


		 Returns a promise which resolves / rejects


		 */
		function login(email, password) {
			var p = $q.defer();


			Backendless.UserService.login( email, password, true,
				new Backendless.Async( function(user){
					p.resolve(user);
					$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				}, function(error){
					p.reject(error.message);
				}) );
			return p.promise;
		}

		/*

		 Signup Function

		 Returns a promise that resolves with nothing or rejects with the error message

		 */
		function signup(name, email, password) {
			var p = $q.defer();

			name = _parseName(name);

			var user = new Backendless.User();
			user.email = email;
			user.password = password;
			user.firstName = name.first;
			user.lastName = name.last;

			Backendless.UserService.register( user,
				new Backendless.Async( function(){
					Session.start().then(function(){
						self.login(email,password).then(function(){
							p.resolve();
							$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
						},function(err){
							p.reject(err);
						});
					},function(error){
						p.reject(error);
					})
				},function(error){
					p.reject(error.message);
				}) );
			return p.promise;
		}

		/*

		Reset a password

		Returns a promise

		 */
		function resetPassword(email){
			var p = $q.defer();

			Backendless.UserService.restorePassword( email,
				new Backendless.Async(function(){
					p.resolve();
				},function(error){
					p.reject(error.message);
				}));
			return p.promise;
		}



		/*

		Sign Out

		 */
		function logout(){
			var p = $q.defer();

			Backendless.UserService.logout( new Backendless.Async( function(){
				Session.clear();
				$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
				p.resolve();
			}, function(error){
				p.reject(error.message);
			}) );

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

