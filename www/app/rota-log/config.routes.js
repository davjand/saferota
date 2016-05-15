(function () {
	'use strict';

	angular
		.module('saferota.rota-log')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('app.view.events', {
				url: '/events',
				views: {
					'tab-settings': {
						templateUrl: 'app/rota-log/events.html',
						controller: 'RotaViewEventController',
						controllerAs: 'vm'
					}
				}

			})
			.state('app.view.logs', {
				url: '',
				views: {
					'tab-logs': {
						templateUrl: 'app/rota-view/logs.html',
						controller: 'RotaViewLogController',
						controllerAs: 'vm'
					}
				}
			})
	}
})();