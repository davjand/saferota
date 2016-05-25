(function () {
	'use strict';

	angular
		.module('saferota', [
			'saferota.core',
			'saferota.app',
			'saferota.auth',
			'saferota.rota',
			'saferota.rota-new',
			'saferota.rota-edit',
			'saferota.rota-view',
			'saferota.tour',
			'saferota.share',
			'saferota.stats'
		]);
})();