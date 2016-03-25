(function () {
	'use strict';

	angular
		.module('jcs-autoValidate')
		.run(errorConfig);

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