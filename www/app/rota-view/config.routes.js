(function () {
	'use strict';

	angular
		.module('saferota.rota-view')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('app.view', {
				url: '/view/:rotaId',
				abstract: true,
				templateUrl: 'app/rota-view/rota-view.html',
				controller: 'RotaViewController',
				controllerAs: 'vm',
				resolve: {
					/* @ngInject */
					currentRota: function (Rota, $stateParams) {
						return Rota.$get($stateParams.rotaId);
					}
				}
			})
			.state('app.view.settings', {
				url: '/settings',
				views: {
					'tab-settings': {
						templateUrl: 'app/rota-view/settings.html',
						controller: 'RotaViewSettingsController',
						controllerAs: 'vm'
					}
				}
			});
	}
})();