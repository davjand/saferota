(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.service('SettingsService', SettingsService);
	
	SettingsService.$inject = ['$ionicModal', '$rootScope'];
	
	/* @ngInject */
	function SettingsService($ionicModal, $rootScope) {
		var self = this;
		
		self.show = show;
		self.hide = hide;
		
		var modal = null;
		var $scope;
		
		////////////////
		
		/**
		 * hide the settings
		 */
		function hide() {
			if (modal) {
				modal.remove();
				modal = null;
				$scope.$destroy();
			}
		}
		
		/**
		 * show the settings
		 */
		function show() {
			if (modal) {
				self.hide();
			}
			
			$scope = $rootScope.$new(true);
			$scope.hide = self.hide;
			
			$ionicModal.fromTemplateUrl('app/rota/settings.html', {
				scope: $scope
			}).then(function (createdModal) {
				modal = createdModal;
				modal.show();
			})
		}
	}
	
})();

