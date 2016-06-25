(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.directive('focusInput', focusInput);
	
	focusInput.$inject = ['$timeout'];
	
	/* @ngInject */
	function focusInput($timeout) {
		return {
			link:     link,
			restrict: 'A',
			scope:    {
				wait: '='
			}
		};
		function link(scope, element, attrs) {
			$timeout(function () {
				element[0].focus();
			}, scope.wait || 500)
		}
	}
})();

