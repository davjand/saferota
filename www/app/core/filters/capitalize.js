(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.filter('capitalize', capitalize);
	
	function capitalize() {
		return capitalizeFilter;
		
		////////////////
		
		/**
		 * converts \n into <br/>
		 *
		 * Shamelessly from
		 * http://codepen.io/WinterJoey/pen/sfFaK
		 *
		 * @param input
		 * @param all
		 * @returns {*}
		 */
		function capitalizeFilter(input, all) {
			var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
			return (!!input) ? input.replace(reg, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}) : '';
		}
		
	}
})();
