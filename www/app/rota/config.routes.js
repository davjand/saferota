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
						isReady: function (App, $q, $state) {
							return App.ready().then(function () {
								if (!App.session.isLoggedIn) {
									$state.go('auth.signup');
								}
								return $q.when();
							});
						}
					}
				}
			)
			.state('app.list', {
				url: '/list',
				templateUrl: 'app/rota/list.html',
				controller: 'RotaListController',
				controllerAs: 'vm',
			});


		//by default go here
		$urlRouterProvider.otherwise('/app/list');
	}
})
();