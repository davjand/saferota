(function () {
	'use strict';

	angular
		.module('saferota.auth', [
			'angular-cache',
			'ui.router',
			'jcs-autoValidate',
			'saferota.backendless',
			'saferota.core'
		]);


	//Configure custom error messages
	angular.module('jcs-autoValidate')
		.run([
			'defaultErrorMessageResolver',
			function (defaultErrorMessageResolver) {
				defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
					errorMessages['authRequired'] = 'Required';
					errorMessages['authEmail'] = 'Invalid Email';
					errorMessages['authMinLength'] = 'Must be {0} or more letters';
				});
			}
		]);

})();