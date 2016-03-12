(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.config(configRoutes)
		.run(configRouteAccess);

	/* @ngInject */
	function configRoutes($stateProvider, $urlRouterProvider) {

		$stateProvider

			.state('login', {
				url: '/login',
				templateUrl: 'app/auth/login.html'
			})
			.state('signup', {
				url: '/signup',
				templateUrl: 'app/auth/signup.html',
				data: {
					anonOnly: true
				}
			})
			.state('resetPassword', {
				url: '/reset-password/:email',
				data: {
					anonOnly: true
				},
				templateUrl: 'app/auth/reset-password.html'
			});


		$urlRouterProvider.otherwise('/login');
	}


	/* @ngInject */
	function configRouteAccess($rootScope, Session, AUTH_EVENTS) {
		/*

		 Listen to state change and reject if not appropriate

		 */
		$rootScope.$on('$stateChangeStart', function (event, next) {

			var isLoggedIn = Session.isLoggedIn,
				data = next.data || {};

			var p = {
				loginOnly: data.loginOnly === true,
				anonOnly: data.anonOnly === true
			};

			if (p.loginOnly && !isLoggedIn ||
				p.anonOnly && isLoggedIn) {
				event.preventDefault();
				$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
			}
		});
	}


})();