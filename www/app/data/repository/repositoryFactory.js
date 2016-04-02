(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('Repository', Repository);

	Repository.$inject = ['DataConfig','$injector', '$q'];

	/* @ngInject */
	function Repository(DataConfig, $injector, $q) {




		/**
		 * Constructor
		 *
		 * Creates a repository for data models
		 *
		 * @param Model
		 * @param localAdapter {String}
		 * @param remoteAdapter {String}
		 *
		 */
		var Repository = function(Model, localAdapter, remoteAdapter){

			/*
			Internal variables
			 */
			this._Model = Model;
			
			this._ready = $q.defer();
			this._configLoaded = false;
			this._updatedAt = null;
			this._isFresh = false;


			/*
			Inject and Create the adapters
			 */

			this._local = new ($injector.get(localAdapter || DataConfig.local))(this._Model._config);
			this._remote = new ($injector.get(remoteAdapter || DataConfig.remote))(this._Model._config);

		};



		//External Interface
		Repository.prototype.save = save;
		Repository.prototype.update = update;
		Repository.prototype.remove = remove;
		Repository.prototype.get = getItem;
		Repository.prototype.find = find;
		Repository.prototype.fetch = fetch;
		Repository.prototype.notify = notify;
		
		//Internal Methods - expose for testing
		Repository.prototype._initConfig = _initConfig;
		Repository.prototype.ready= function(){return this._ready.promise;};
		

		
		return Repository;


		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		function fetch(){
			var p = $q.defer();

			//check initialized
			if(!this._configLoaded){
				this._initConfig().then(function(){

				});
			}


			return p.promise;
		}


		function save(model){
			//save
			if(model._isNew){

			}
			//update
			else{

			}
		}

		/**
		 * notify
		 *
		 * Receives a resolved transaction
		 *
		 * @param transaction
		 */
		function notify(transaction) {
			
		}

		function remove(model){

		}

		function getItem(id){


		}

		function find(){


		}


		
		function update(){
			
		}


		////////////////////////////////

		// Internal Function Definitions

		////////////////////////////////

		/**
		 * initConfig
		 *
		 * Loads the configuration from the local provider
		 *  - Sets the update date
		 *  - Sets _isFresh to true if no config
		 *
		 * @returns {Promise|*}
		 * @private
		 */
		function _initConfig(){
			var self = this;
			if(!self._configLoaded){
				self._local.updatedAt().then(function(updatedAt){
					if(updatedAt instanceof Date){
						self._updatedAt = updatedAt;
						self._isFresh = false;
					}else{
						self._isFresh = true;
					}
					self._configLoaded = true;
					self._ready.resolve();
				},_err(self._ready));
			}
			return self._ready.promise;
		}




		/**
		 * _err
		 *
		 * Factory function to handle promise failures
		 *
		 * Takes a promise that will be rejected with the error message
		 *
		 * Can be passed as the second parameter in a then function
		 *
		 * @param p {Promise}
		 * @returns {Function}
		 * @private
		 */
		function _err(p){
			return function(error){
				p.reject(error);
			}
		}

	}

})();
