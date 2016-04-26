(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('app.new', {
				url: '/new',
				templateUrl: 'app/rota-new/new.html'
			});
	}
})();