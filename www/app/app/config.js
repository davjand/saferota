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
	
	//enable analytics
	document.addEventListener('deviceready', onDeviceReady, false);
	function onDeviceReady() {
		if (Crittercism) {
			Crittercism.init({'iosAppID': '126b16a034af4cd39ff4759726cc75a900555300'});
			Crittercism.setLogUnhandledExceptionAsCrash(true);
		}
	}

})();