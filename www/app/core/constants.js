/* global moment:false */
(function () {
	'use strict';

	angular
		.module('saferota.core')
		.constant('moment', moment)
		.constant('DATA_EVENTS', {
			REFRESH_DATA: 'REFRESH_DATA'
		});

})();