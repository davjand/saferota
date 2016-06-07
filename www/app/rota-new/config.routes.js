(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('app.new', {
				url:      '/new',
				abstract: true,
				template: '<ion-nav-view class="rota-new"></ion-nav-view>'
			})
			.state('app.new.start', {
				url:          '',
				templateUrl:  'app/rota-new/start/start.html',
				controller:   'NewRotaStartController',
				controllerAs: 'vm'
			})
			.state('app.new.location', {
				url:          'location/:locationId',
				templateUrl:  'app/rota-new/location/location.html',
				controller:   'NewLocationController',
				controllerAs: 'vm'
			})
			.state('app.new.settings', {
				url:          '/settings',
				templateUrl:  'app/rota-new/settings/settings.html',
				controller:   'NewRotaSettingsController',
				controllerAs: 'vm'
			})
			.state('app.new.complete', {
				url:          '/complete',
				templateUrl:  'app/rota-new/complete/complete.html',
				controller:   'NewRotaCompleteController',
				controllerAs: 'vm'
			});
	}
})();