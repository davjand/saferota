(function () {
	'use strict';

	angular
		.module('saferota.rota-new')
		.directive('locationPicker', locationPicker);

	locationPicker.$inject = [
		'$cordovaGeolocation',
		'google'];

	/* @ngInject */
	function locationPicker($cordovaGeolocation,
							google) {

		return {
			templateUrl: 'app/core/directives/location-picker/locationPicker.html',
			scope: {
				location: '='
			},
			link: function ($scope, element, attrs) {

				$scope = $scope || {};


				$scope.initMap = initMap;
				$scope.drawLocation = drawLocation;
				$scope.setPosition = setPosition;


				activate();


				//////////////////////////////////////////////

				// Function Definitions

				//////////////////////////////////////////////

				/**
				 * activate
				 *
				 *
				 */
				function activate() {

					$scope.location = $scope.location || {};

					$scope.map = null;
					$scope.marker = null;
					$scope.circle = null;

					/*
					 * Center the map using geolocation
					 */
					$cordovaGeolocation.getCurrentPosition({
						timeout: 6000,
						enableHighAccuracy: true
					}).then(function (position) {
						var lat, lng;
						/*
						 * If location already created, center there
						 */
						if ($scope.location.lat) {
							lat = $scope.location.lat;
							lng = $scope.location.long;
						} else {
							lat = position.coords.latitude;
							lng = position.coords.longitude;
						}
						$scope.initMap(lat, lng);
					}, function (error) {
						$scope.initMap(51.528969, -0.165011);
					});
				}

				/**
				 * initMap
				 *
				 * Inits a google map within the view
				 *
				 * @param lat
				 * @param lng
				 */
				function initMap(lat, lng) {
					var latLng = new google.maps.LatLng(lat, lng);
					var map = element[0].querySelector('#map');

					/*
					 * Draw a new map
					 */
					$scope.map = new google.maps.Map(map, {
						center: latLng,
						zoom: 15,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						clickableIcons: false,
						fullscreenControl: false,
						streetViewControl: false
					});

					/*
					 * Event handler to watch for a click
					 */
					$scope.map.addListener('click', function (event) {
						$scope.setPosition(event.latLng);
						$scope.drawLocation();
					});

					/*
					 * If the location exists the center it there
					 */
					if ($scope.location.lat) {
						$scope.drawLocation();
					}

					/*
					 * Watch the location change and redraw
					 */
					$scope.$watch('location', function () {
						$scope.drawLocation();
					});
				}

				/**
				 * drawLocation
				 *
				 * Draws a marker and a circle around it
				 *
				 * Uses $scope.location
				 *            .lat
				 *            .long
				 *            .radius
				 *
				 */
				function drawLocation() {
					var latLng = new google.maps.LatLng($scope.location.lat, $scope.location.long);

					/*
					 * Draw / Update the Marker
					 */
					if (!$scope.marker) {
						$scope.marker = new google.maps.Marker({
							position: latLng,
							map: $scope.map,
							icon: '/img/location/pin.png',
							draggable: true
						});

						//Drag Support
						$scope.marker.addListener('dragend', function (event) {
							$scope.setPosition(event.latLng);
							$scope.drawLocation();
						});


					} else {
						$scope.marker.setPosition(latLng);
					}
					/*
					 * Draw / Update the circle
					 */
					if (!$scope.circle) {
						$scope.circle = new google.maps.Circle({
							map: $scope.map,
							radius: $scope.location.radius,    // 10 miles in metres
							fillColor: '#4A90E2',
							fillOpacity: 0.2,
							strokeColor: '#4A90E2',
							strokeWeight: 2
						});
						$scope.circle.bindTo('center', $scope.marker, 'position');

					} else {
						//update the radius
						$scope.circle.setRadius(parseFloat($scope.location.radius));
					}
				}

				/**
				 * setPosition
				 *
				 * Sets the location position from a google latLng object
				 *
				 * @param latLng
				 */
				function setPosition(latLng) {
					$scope.location.lat = latLng.lat();
					$scope.location.long = latLng.lng();
				}
			}
		};


	}
})();

