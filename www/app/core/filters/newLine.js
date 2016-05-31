(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.filter('newLine', newlines);
	
	function newlines() {
		return newlinesFilter;
		
		////////////////
		
		/**
		 * converts \n into <br/>
		 *
		 * @param text
		 * @returns {*}
		 */
		function newlinesFilter(text) {
			if (!text || text == null) {
				return '';
			}
			return text.replace(/\n/g, '<br/>');
		}
	}
	
})();
