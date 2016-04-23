(function () {
	'use strict';

	angular
		.module('saferota.core')
		.service('RotaService', RotaService);

	RotaService.$inject = ['DataStore', 'Session'];

	/* @ngInject */
	function RotaService(DataStore, Session) {

		/*
		 * Module Definition
		 */
		this.create = create;
		this.save = save;
		this.get = get;
		this.getAll = getAll;

		this.addLocation = addLocation;
		this.removeLocation = removeLocation;

		/*
		 * Init
		 */
		var Rota = DataStore.create('Rotas')
			.key('objectId')
			.schema({
				label: '',
				hours: 0,
				dateStart: '',
				dateEnd: '',
				banding: ''
			})
			.relationship('hasOne', 'organisation', 'RotaOrganisations')
			.relationship('hasOne', 'speciality', 'RotaSpecialities')
			.relationship('hasOne', 'role', 'RoleRoles')
			.relationship('hasMany', 'locations', 'RotaLocations.rota')
			.config({
				sync: function () {
					return {
						user: Session.user.objectId || null
					}
				}
			});


		var RotaLocation = DataStore.create('RotaLocations')
			.schema({
				location: {},
				radius: ''
			})
			.relationship('hasOne', 'rota', 'Rotas');


		////////////////

		/**
		 * create
		 *
		 * Create a rota
		 *
		 * @param data
		 * @param $scope
		 * @returns {Promise}
		 */
		function create(data, $scope) {
			var rota = Rota.create(data, $scope);
			return DataStore.save(rota);
		}

		/**
		 * save
		 *
		 * Save a rota
		 *
		 * @param rota
		 * @param $scope
		 * @returns {Promise}
		 */
		function save(rota, $scope) {
			return DataStore.save(rota, $scope);
		}


		/**
		 * get
		 *
		 * @param id
		 * @param $scope
		 * @returns {*}
		 */
		function get(id, $scope) {
			return DataStore.get(Rota, id, $scope);
		}

		/**
		 * getAll
		 *
		 * @param $scope
		 * @returns {*}
		 */
		function getAll($scope) {
			return DataStore.find(Rota, {}, $scope);
		}


		/**
		 * addLocation
		 *
		 * @param data
		 * @param rota
		 * @param $scope
		 * @returns {Promise}
		 */
		function addLocation(data, rota, $scope) {
			var location = RotaLocation.create(data, $scope);
			return location.$set('rota', rota);
		}

		/**
		 * removeLocation
		 *
		 *
		 * @param location
		 * @param rota
		 *
		 * @returns {Promise}
		 */
		function removeLocation(location, rota) {
			return location.$remove('rota', rota);
		}


	}

})();

