(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.config(config);

	/* @ngInject */
	function config(BackandProvider){
		BackandProvider.setAppName('saferota')
			.setAnonymousToken('d0c951cf-be4a-4088-a4b4-f9d70168b455')
			.setSignUpToken('49cbbbfa-8098-4663-a6d0-4b545ce51141');
	}

})();