(function () {
	'use strict';

	angular
		.module('saferota.stats')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('app.view.stats', {
				url: '/stats',
				views: {
					'tab-stats': {
						templateUrl: 'app/stats/stats.html',
						controller: 'StatsController',
						controllerAs: 'vm'
					}
				}
			})
	}
})();