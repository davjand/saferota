/* global moment:false */
(function () {
	'use strict';

	angular
		.module('saferota.core')
		.constant('moment', moment)
		.constant('google', window.google || {})
		.constant('APP_MSG', {
			SYNC_NOW: 'SYNC_NOW',
			SYNC_FRESH: 'SYNC_FRESH'
		})
		.constant('AUTH_EVENTS', {
			loginSuccess: 'auth-login-success',
			loginFailed: 'auth-login-failed',
			logoutSuccess: 'auth-logout-success',
			notAuthenticated: 'auth-not-authenticated',
		}
	);

})();