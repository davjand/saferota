(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('dataService', dataService);

	dataService.$inject = ['Backendless','$q','CacheFactory'];

	/**
	 * dataService
	 *
	 *
	 * Service to retrieval and caching of API data
	 *
	 *
	 */

	/* @ngInject */
	function dataService(Backendless,$q, CacheFactory) {

		//shorthand;
		this._w = _wrapBackendless;

		//functions
		this._wrapBackendless = _wrapBackendless;


		////////////////


		/**
		 * _wrapAPI
		 *
		 * Function to wrap the Backendless API in a promise for ease of use
		 *
		 * To use call dataService.w(Backendless.service,'function',params).then...
		 *
		 * @param object - Object to call on
		 * @param fx {String} - Function to Call
		 * @returns {Deferred|*|{resolve, reject, promise}}
		 * @private
		 */
		function _wrapBackendless(object, fx, params) {
			var p = $q.defer();
			var callback = new Backendless.Async(function(success){
				p.resolve(success);
			},function(error){
				p.reject(error);
			});

			//ensure the async object is last in the params
			params = params || [];
			if(!angular.isArray(params)){
				params = [params];
			}

			params.push(callback);



			object[fx].apply(object,params);

			return p.promise;
		}
	}

})();

