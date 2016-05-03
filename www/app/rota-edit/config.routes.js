(function () {
	'use strict';

	angular
		.module('saferota.rota-edit')
		.config(configRoutes);

	/* @ngInject */
	function configRoutes($stateProvider) {

		$stateProvider
			.state('app.edit', {
				url: '/edit/:rotaId',
				templateUrl: 'app/rota-edit/edit.html',
				controller: 'EditRotaController',
				controllerAs: 'vm',
				resolve: {
					/* @ngInject */
					rotaToEdit: function (Rota, $stateParams) {
						return Rota.$get($stateParams.rotaId);
					}
				}
			})
			.state('app.edit-location', {
				url: '/edit/:rotaId/location',
				templateUrl: 'app/rota-edit/location.html',
				controller: 'EditLocationPickerController',
				controllerAs: 'vm',
				resolve: {
					/* @ngInject */
					rotaToEdit: function (Rota, $stateParams) {
						return Rota.$get($stateParams.rotaId);
					}
				}
			});
	}
})();