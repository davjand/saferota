(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.filter('newLine', newlines);
	
	function newlines() {
		return newlinesFilter;
		
		////////////////
		
		function newlinesFilter(text) {
			return text.replace(/\n/g, '<br/>');
		}
	}
	
})();
