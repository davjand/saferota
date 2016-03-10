(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.service('AuthService', AuthService);

	AuthService.$inject = ['Backand','User','Session'];

	/* @ngInject */
	function AuthService(backand,User,Session) {
		var self = this;

		self.login = login;
		self.signup = signup;

		////////////////

		function login(email,password){
			
		}

		function signup(name,email,password){

		}
	}

})();

