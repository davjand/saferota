(function () {
	'use strict';

	angular
		.module('saferota.data')
		.factory('Repository', Repository);

	Repository.$inject = ['DataConfig','$injector', '$q'];

	/* @ngInject */
	function Repository(DataConfig, $injector, $q) {

		var LocalProvider = $injector.get(DataConfig.local);
		//var remoteProvider = $injector.get(DataConfig.remote);


		/**
		 * Constructor
		 *
		 * Creates a repository for data models
		 *
		 * @param Model
		 *
		 */
		var Repository = function(Model){

			this._model = Model;

			/*
			Create the storage repositories
			 */
			this.local = new LocalProvider(Model.className())

		};

		//repositories
		Repository.prototype.save = save;
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



	}

})();
