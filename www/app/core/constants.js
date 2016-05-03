/* global moment:false */
(function () {
	'use strict';

	angular
		.module('saferota.core')
		.constant('moment', moment)
		.constant('google', window.google || {})
		.constant('DATA_EVENTS', {
			REFRESH_DATA: 'REFRESH_DATA'
		}).constant('AUTH_EVENTS', {
			loginSuccess: 'auth-login-success',
			loginFailed: 'auth-login-failed',
			logoutSuccess: 'auth-logout-success',
			sessionTimeout: 'auth-session-timeout',
			notAuthenticated: 'auth-not-authenticated',
			notAuthorized: 'auth-not-authorized'
		}
	);

})();