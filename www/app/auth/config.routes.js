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
					auth: function (AuthService) {
						return AuthService.isReady()
					}

				},
				/* @ngInject */
				onEnter: function (AuthService, $state) {
					if (AuthService.getSession().isLoggedIn) {
						$state.go('app.list');
					}
				}
			})
			.state('auth.login', {
				url: '',
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