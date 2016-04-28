(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.controller('LocationPickerController', LocationPickerController);

	LocationPickerController.$inject = [
		'$scope',
		'NewRotaService',
		'$cordovaGeolocation'];

	/* @ngInject */
	function LocationPickerController($scope,
									  NewRotaService,
									  $cordovaGeolocation) {
		var vm = this;

		vm.location = NewRotaService.createLocation();
		vm.geopoint = {};

		vm.initMap = initMap;

		activate();


		//////////////////////////////////////////////

		// Function Definitions

		//////////////////////////////////////////////

		/**
		 * activate
		 *
		 * Initialiser
		 */
		function activate() {
			$cordovaGeolocation.getCurrentPosition({
				timeout: 6000,
				enableHighAccuracy: true
			}).then(function (position) {
				vm.initMap(
					new google.maps.LatLng(
						position.coords.latitude,
						position.coords.longitude
					)
				);

			}, function (error) {
				vm.initMap(
					new google.maps.LatLng(51.528969, -0.165011)
				)
			});
		}

		/**
		 * initMap
		 *
		 * Inits a google map within the view
		 *
		 * @param latLng
		 */
		function initMap(latLng) {

			var mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);

			/*
			 google.maps.event.addListener(map, 'click', function(event) {
			 marker = new google.maps.Marker({
			 position: event.latLng,
			 map: map
			 });
			 });
			 */


		}
	}
})();

