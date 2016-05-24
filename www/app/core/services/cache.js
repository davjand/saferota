(function () {
	'use strict';

	angular
		.module('saferota.core')
		.factory('Cache', Cache);

	Cache.$inject = ['CacheFactory'];

	/* @ngInject */
	function Cache(CacheFactory) {
		var self = this;

		var CACHE_NAME = 'Cache';

		return _cache();


		/**
		 * _cache
		 *
		 * get (create if needed) a cache
		 *
		 * @private
		 */
		function _cache() {

			if (!CacheFactory.get(CACHE_NAME)) {
				CacheFactory.createCache(CACHE_NAME, {
					storageMode: 'localStorage',
					deleteOnExpire: 'none'
				});
			}
			return CacheFactory.get(CACHE_NAME);
		}
	}

})();

