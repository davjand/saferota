(function () {
	'use strict';

	angular
		.module('saferota.app')
		.run(appRun);


	appRun.$inject = ['App'];

	/* @ngInject */
	function appRun(App) {
		App.start();
	}


})();