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
						templateUrl:  'app/rota-log/controllers/events.html',
						controller:   'RotaViewEventController',
						controllerAs: 'vm'
					}
				}

			})
			.state('app.view.logs', {
				url: '/logs',
				views: {
					'tab-logs': {
						templateUrl:  'app/rota-log/controllers/logs.html',
						controller:   'RotaViewLogController',
						controllerAs: 'vm'
					}
				}
			})
			.state('app.view.logs-edit', {
				url: '/logs/edit/:timespanId',
				views: {
					'tab-logs': {
						templateUrl:  'app/rota-log/controllers/edit.html',
						controller:   'RotaLogEditController',
						controllerAs: 'vm',
						resolve:      {
							/* @ngInject */
							currentTimespan: function (RotaTimespan, $stateParams) {
								return RotaTimespan.$get($stateParams.timespanId);
							}
						}
					}
				}
			})
	}
})();