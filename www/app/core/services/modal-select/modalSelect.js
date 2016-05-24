(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('ModalSelect', ModalSelect);

	ModalSelect.$inject = [
		'$rootScope',
		'$ionicModal',
		'$q',
		'$filter',
		'$ionicScrollDelegate',
		'$timeout'
	];

	/* @ngInject */
	function ModalSelect($rootScope,
						 $ionicModal,
						 $q,
						 $filter,
						 $ionicScrollDelegate,
						 $timeout) {
		var self = this,
			offScope = null;


		self.show = show;
		self.hide = hide;
		self.modal = null;
		self.$scope = null;

		////////////////

		/**
		 * show
		 *
		 * Shows a model select box
		 *
		 * Expects options to contain
		 * - items - Array of items
		 * - selected - Currently selected
		 * - title - The title for the modal
		 * - callback - A function that will be called with the value
		 *
		 * Optional
		 * - nameKey - The key where the name can be reached
		 * - valueKey - The key were the value van be reached
		 *
		 * @param options
		 * @param $currentScope - Used to bind a destroy if needed @TODO
		 */
		function show(options, $currentScope) {
			options = options || {};

			if (self.modal) {
				self.hide();
			}

			self.$scope = $rootScope.$new(false);

			/*
			 * Required items (with intelligent defaults)
			 */
			self.$scope.title = options.title || 'Please Select';
			self.$scope.selected = options.selected || null;
			self.$scope.callback = options.callback || null;

			self.$scope.items = [];
			self.$scope.otherItem = {};

			/*
			 * Support promised data
			 */
			$q.when(options.items || {}).then(function (items) {
				self.$scope.items = items;
				self.$scope.otherItem = $filter('filter')(items, {other: true}, true);
			});

			//Check a function
			if (!angular.isFunction(self.$scope.callback)) {
				throw('No Callback Passed');
			}

			/*
			 * Optional
			 */
			self.$scope.valueKey = options.valueKey || 'objectId';
			self.$scope.nameKey = options.nameKey || 'name';

			/*
			 * System functions
			 */
			self.$scope.search = "";
			self.$scope.hide = self.hide;

			/*
			 * Create the modal
			 */
			$ionicModal.fromTemplateUrl('app/core/services/modal-select/modalSelect.html', {
				scope: self.$scope,
				animation: 'slide-in-up'
			}).then(function (createdModal) {
				self.modal = createdModal;
				return self.modal.show()
			}).then(function () {
				$timeout(function () {
					$ionicScrollDelegate.resize(); //adjust the size as the keyboard will probable be up
				}, 500)
			});

			/*
			 * Bind Scope
			 */
			if ($currentScope && $currentScope.$on) {
				offScope = $currentScope.$on('$destroy', function () {
					hide();
				});
			}
		}

		/**
		 * hide
		 *
		 * Hides the modal
		 *
		 */

		function hide() {
			if (offScope) {
				offScope();
				offScope = null;
			}

			self.$scope.$destroy();
			self.$scope = null;

			if (self.modal) {
				self.modal.remove().then(function () {
					self.modal = null;
				});
			}
		}
	}

})();

