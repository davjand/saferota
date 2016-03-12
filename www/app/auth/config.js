(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.config(apiConfig);

	angular
		.module('jcs-autoValidate')
		.run(errorConfig);

	/*

	 Backand API

	 */

	/* @ngInject */
	function apiConfig(BackandProvider) {
		BackandProvider
			.setAppName('saferota')
			.setAnonymousToken('d0c951cf-be4a-4088-a4b4-f9d70168b455')
			.setSignUpToken('49cbbbfa-8098-4663-a6d0-4b545ce51141')
			.manageHttpInterceptor(true)
			.manageRefreshToken(true)
			.runSigninAfterSignup(false);
	}

	/*

	 Error Messages

	 */

	/* @ngInject */
	function errorConfig(defaultErrorMessageResolver) {
		defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
			errorMessages['authRequired'] = 'Required';
			errorMessages['authEmail'] = 'Invalid Email';
			errorMessages['authMinLength'] = 'Must be {0} or more letters';
		});
	}

})();