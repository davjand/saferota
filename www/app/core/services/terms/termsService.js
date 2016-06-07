(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.service('TermsService', TermsService);
	
	TermsService.$inject = ['$ionicModal', '$rootScope'];
	
	/* @ngInject */
	function TermsService($ionicModal, $rootScope) {
		var self = this,
			modal, $scope;
		
		self.show = show;
		
		
		activate();
		
		/**
		 * activate
		 */
		function activate() {
			modal = null;
			$scope = $rootScope.$new();
			
			$scope.close = function () {
				modal.remove();
			};
		}
		
		
		/**
		 *
		 * show a modal
		 *
		 */
		function show() {
			$ionicModal.fromTemplateUrl('app/core/services/terms/terms.html', {
				scope: $scope
			})
				.then(function (createdModal) {
					modal = createdModal;
					modal.show();
				});
		}
		
		
	}
	
})();

