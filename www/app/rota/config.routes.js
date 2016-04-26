(function () {
	'use strict';

	angular
		.module('saferota.rota')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider, $urlRouterProvider) {

		$stateProvider
			.state('app', {
				abstract: true,
				url: '/app',
				templateUrl: 'app/rota/app.html',
				resolve: {
					/* @ngInject */
					auth: function (AuthService) {
						return AuthService.isReady()
					}
				},
				/* @ngInject */
				onEnter: function (AuthService, $state) {
					if (!AuthService.getSession().isLoggedIn) {
						$state.go('auth.login');
					}
				}
			})
			.state('app.main', {
				url: '/main',
				templateUrl: 'app/rota/main.html',

				resolve: {
					/* @ngInject */
					currentRotas: function (RotaService) {
						//Redirect to new if no rotas selected
						return RotaService.getAll();
					}
				},
				/* @ngInject */
				onEnter: function (currentRotas, $state) {
					if (currentRotas.length < 1) {
						$state.go('app.new');
					}
				}
			});

		//by default go here
		$urlRouterProvider.otherwise('/app/main');
	}
})();