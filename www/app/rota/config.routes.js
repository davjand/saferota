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
			.state('app.list', {
				url: '/list',
				templateUrl: 'app/rota/list.html',
				controller: 'RotaListController',
				controllerAs: 'vm',
				resolve: {
					/* @ngInject */
					userRotas: function (Rota) {
						//Redirect to new if no rotas selected
						return Rota.$find();
					}
				},
				/* @ngInject */
				onEnter: function (userRotas, $state) {
					if (userRotas.length < 1) {
						$state.go('app.new');
					}
				}
			});

		//by default go here
		$urlRouterProvider.otherwise('/app/list');
	}
})();