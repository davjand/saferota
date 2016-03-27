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
		 * @param remoteProvider {String}
		 *
		 */
		var Repository = function(Model, localAdapter, remoteAdapter){
			this._model = Model;

			//set defaults
			localAdapter = localAdapter || DataConfig.local;
			remoteAdapter = remoteAdapter || DataConfig.remote;

			/*
			Inject the storage repositories
			 */
			var LocalProvider = $injector.get(localAdapter);
			var RemoteProvider = $injector.get(remoteAdapter);

			/*
			Create the adapters
			 */
			this._local = new LocalProvider(Model.config());
			this._remote = new RemoteProvider(Model.config());

		};

		//repositories
		Repository.prototype.save = save;
		Repository.prototype.update = update;
		Repository.prototype.remove = remove;
		Repository.prototype.get = getItem;
		Repository.prototype.find = find;
		Repository.prototype.fetch = fetch;




		return Repository;


		////////////////////////////////

		// Function Definitions

		////////////////////////////////

		function save(model){
			//save
			if(model._isNew){

			}
			//update
			else{

			}
		}

		function remove(model){

		}

		function getItem(id){


		}

		function find(){


		}

		function fetch(){


		}
		
		function update(){
			
		}



	}

})();
