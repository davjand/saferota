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
						isReady: function (App) {
							return App.ready();
						}

					}

				}
			)
			.state('app.list', {
				url: '/list',
				templateUrl: 'app/rota/list.html',
				controller: 'RotaListController',
				controllerAs: 'vm',
				resolve: {
					/* @ngInject */
					userRotas: function (Rota) {
						return Rota.$find();
					},
					/* @ngInject */
					activeRotas: function (RotaGeoFenceService) {
						return RotaGeoFenceService.getActiveRotaIds()
					}
				}
			})
			.state('app.settings', {
				url: '/settings',
				templateUrl: 'app/rota/settings.html',
				controller: 'SettingsController',
				controllerAs: 'vm'
			});


//by default go here
		$urlRouterProvider.otherwise('/app/list');
	}
})
();