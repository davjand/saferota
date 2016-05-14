(function () {
	'use strict';

	angular
		.module('saferota', [
			'saferota.core',
			'saferota.auth',
			'saferota.rota',
			'saferota.rota-new',
			'saferota.rota-edit',
			'saferota.rota-view'
		]);
})();