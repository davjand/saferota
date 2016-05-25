/* global moment:false */
(function () {
	'use strict';

	angular
		.module('saferota.core')
		.constant('moment', moment)
		.constant('google', window.google || {})
		.constant('APP_MSG', {
			SYNC_NOW: 'SYNC_NOW',
			SYNC_FRESH: 'SYNC_FRESH',
			GEO_ACTIVATE: 'GEO_ACTIVATE',
			GEO_DEACTIVATE: 'GEO_DEACTIVATE'
		})
		.constant('AUTH_EVENTS', {
			loginSuccess: 'auth-login-success',
			loginFailed: 'auth-login-failed',
			logoutSuccess: 'auth-logout-success',
				notAuthenticated: 'auth-not-authenticated'
		}
		).constant('UI_EVENTS', {
		KEYBOARD_ACCESSORY_SHOW: 'KEYBOARD_ACCESSORY_SHOW',
		KEYBOARD_ACCESSORY_HIDE: 'KEYBOARD_ACCESSORY_HIDE'
	})

})();