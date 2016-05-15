(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('AuthService', AuthService);

	AuthService.$inject = [
		'Backendless',
		'Session',
		'$q',
		'$rootScope',
		'AUTH_EVENTS'
	];

	/* @ngInject */
	function AuthService(Backendless, Session, $q, $rootScope, AUTH_EVENTS) {
		var self = this;

		//Public
		self.login = login;
		self.signup = signup;
		self.logout = logout;
		self.resetPassword = resetPassword;

		//Private
		self._parseName = _parseName;

		/**
		 * login
		 *
		 * If successful, starts the session
		 *
		 * @param email
		 * @param password
		 * @returns {Function}
		 */
		function login(email, password) {
			var p = $q.defer();


			Backendless.UserService.login( email, password, true,
				new Backendless.Async( function(user){
					Session.start(user.objectId).then(function () {
						$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
						p.resolve();
					});
				}, function(error){
					p.reject(error.message);
				}) );
			return p.promise;
		}

		/**
		 * signup
		 *
		 * Registers the user.
		 *
		 * If successful, logs the user in
		 *
		 *
		 * @param name
		 * @param email
		 * @param password
		 * @returns {Promise}
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
						self.login(email,password).then(function(){
							p.resolve();
						},function(err){
							p.reject(err);
						});
					},function(error){
						p.reject(error);
					})
				);
			return p.promise;
		}

		/**
		 * resetPassword
		 *
		 * @param email
		 * @returns {Function}
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


		/**
		 * logout
		 *
		 * log the user out and clear the session
		 * Emits AUTH_EVENTS.logoutSuccess if successful
		 *
		 * @returns {Function}
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

		/**
		 * _parseName
		 *
		 * parses a name into a firstname and lastname
		 *
		 * @param name
		 * @returns {{first: string, last: string}}
		 * @private
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

	}

})();

