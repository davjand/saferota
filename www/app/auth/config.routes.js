(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider, $urlRouterProvider){

		$stateProvider
			.state('login',{
				url: '/login',
				templateUrl: 'app/auth/login.html'
			})
			.state('signup',{
				url: '/signup',
				templateUrl: 'app/auth/signup.html'
			});

		$urlRouterProvider.otherwise('/login');
	}

})();