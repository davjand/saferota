(function () {
	'use strict';

	angular
		.module('saferota.share')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('app.view.share', {
				url: '/share',
				views: {
					'tab-share': {
						templateUrl: 'app/share/share.html',
						controller: 'ShareController',
						controllerAs: 'vm'
					}
				}
			})
	}
})();