(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('app.new', {
				url:          '/new/start',
				templateUrl:  'app/rota-new/start/start.html',
				controller:   'NewRotaStartController',
				controllerAs: 'vm'
			})
			.state('app.new-location', {
				url:          '/new/location/:locationId',
				templateUrl:  'app/rota-new/location/location.html',
				controller:   'NewLocationController',
				controllerAs: 'vm'
			})
			.state('app.new-settings', {
				url:          '/new/settings',
				templateUrl:  'app/rota-new/settings/settings.html',
				controller:   'NewRotaSettingsController',
				controllerAs: 'vm'
			})
			.state('app.new-complete', {
				url:          '/new/complete',
				templateUrl:  'app/rota-new/complete/complete.html',
				controller:   'NewRotaCompleteController',
				controllerAs: 'vm'
			});
	}
})();