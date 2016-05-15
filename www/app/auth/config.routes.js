(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('auth', {
				abstract: true,
				url: '/auth',
				templateUrl: 'app/auth/auth.html',
				/* @ngInject */
				resolve: {
					app: function (Session) {
						return Session.ready()
					}
				},
				/* @ngInject */
				onEnter: function (App, $state) {
					if (App.session.isLoggedIn) {
						$state.go('app.list');
					}
				}
			})
			.state('auth.login', {
				url: '/login',
				templateUrl: 'app/auth/login.html'
			})
			.state('auth.signup', {
				url: '/signup',
				templateUrl: 'app/auth/signup.html'
			})
			.state('auth.resetPassword', {
				url: '/reset-password/:email',
				templateUrl: 'app/auth/reset-password.html'
			});
	}

})();