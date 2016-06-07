(function () {
	'use strict';

	angular
		.module('saferota.core', [
			/*
			 Angular Modules
			 */

			'ngAnimate',
			'ngCordova',
			/*
			 3rd Party modules
			 */
			'ionic',
			'toastr',
			'angular-ladda',
			'angular-cache',
			'saferota.data',
			'saferota.backendless',
		]);
})();