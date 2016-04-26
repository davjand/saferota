(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('ModalSelect', ModalSelect);

	ModalSelect.$inject = ['$rootScope', '$ionicModal', '$q'];

	/* @ngInject */
	function ModalSelect($rootScope, $ionicModal, $q) {
		var self = this,
			modal = null;


		self.show = show;
		self.hide = hide;

		////////////////

		/**
		 * show
		 *
		 * Shows a model select box
		 * Expects options to contain
		 *
		 * items - Array of items
		 * selected - Currently selected
		 * title - The title for the modal
		 * callback - A function that will be called with the value
		 *
		 * @param options
		 * @param $currentScope - Used to bind a destroy if needed @TODO
		 */
		function show(options, $currentScope) {
			options = options || {};

			if (modal) {
				self.hide();
			}

			var $scope = $rootScope.$new(false);

			/*
			 * Required items (with intelligent defaults)
			 */
			$scope.title = options.title || 'Please Select';
			$scope.selected = options.selected || null;
			$scope.callback = options.callback || null;

			/*
			 * Support promised data
			 */
			$q.when(options.items || {}).then(function (items) {
				$scope.items = items;
			});

			//Check a function
			if (!angular.isFunction($scope.callback)) {
				throw('No Callback Passed');
			}

			/*
			 * Optional
			 */
			$scope.valueKey = options.valueKey || 'objectId';
			$scope.nameKey = options.nameKey || 'name';

			/*
			 * System functions
			 */
			$scope.search = "";
			$scope.hide = hide;

			/*
			 * Create the modal
			 */
			$ionicModal.fromTemplateUrl('app/core/modal-select/modalSelect.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (createdModal) {
				modal = createdModal;
				modal.show();
			});
		}

		/**
		 * hide
		 *
		 * Hides the modal
		 *
		 */

		function hide() {
			if (modal) {
				modal.hide();
			}
			modal = null;
		}
	}

})();
