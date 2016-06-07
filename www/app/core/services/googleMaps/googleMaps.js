(function () {
	'use strict';
	
	angular
		.module('saferota.core')
		.service('GoogleMaps', GoogleMaps);
	
	GoogleMaps.$inject = [
		'NetworkConnection',
		'$window',
		'$rootScope',
		'NETWORK_MSG',
		'$ionicPopup'
	];
	
	/* @ngInject */
	function GoogleMaps(NetworkConnection,
						$window,
						$rootScope,
						NETWORK_MSG,
						$ionicPopup) {
		var self = this;
		
		self.$$prompt = null;
		self.$$promptCallback = null;
		
		self.$isLoaded = false;
		self.api = {};
		
		
		/*
		 * Core Functionality
		 */
		self.activate = activate;
		self.continueIfLoadedOrPrompt = continueIfLoadedOrPrompt;
		
		/*
		 * Internal Methods
		 */
		self.loadGoogleMapsAPI = loadGoogleMapsAPI;
		self.insertGoogleMapsAPIScriptTag = insertGoogleMapsAPIScriptTag;
		self.setupGoogleMapsLoadedCallback = setupGoogleMapsLoadedCallback;
		self.resetPromptAndCallback = resetPromptAndCallback;
		
		////////////////////////////////////////
		
		// Function Definitions
		
		////////////////////////////////////////
		
		/**
		 * activate the service
		 */
		function activate() {
			if (NetworkConnection.isOnline()) {
				self.loadGoogleMapsAPI();
			} else {
				//Listen to rootScope for online event
				var deregisterOnlineListener = $rootScope.$on(NETWORK_MSG.ONLINE, function () {
					self.loadGoogleMapsAPI();
					deregisterOnlineListener();
				});
			}
		}
		
		/**
		 * Reset the interval variables to null
		 */
		function resetPromptAndCallback() {
			self.$$prompt = null;
			self.$$promptCallback = null;
		}
		
		/**
		 * will call continue callback if maps are loaded.
		 *
		 * If not, displays a prompt for the user to go online with retry or cancel buttons
		 *
		 * @param continueCallback
		 * @param cancelCallback
		 * @param title
		 */
		function continueIfLoadedOrPrompt(continueCallback, cancelCallback, title) {
			title = title || "You must be online to perform this action";
			
			if (self.$isLoaded) {
				continueCallback();
				self.resetPromptAndCallback();
			} else {
				//cache the callback and prompt incase load is triggered in the meantime
				self.$$promptCallback = continueCallback;
				self.$$prompt = $ionicPopup.confirm({
					title:      title,
					subTitle:   'Press retry when you are online or cancel to go back',
					okText:     'Retry',
					okType:     'button-energized',
					cancelText: 'Back',
					cancelType: 'button-subtle'
				}).then(function (confirmResult) {
					if (confirmResult) {
						self.continueIfLoadedOrPrompt(continueCallback, cancelCallback, title);
					} else {
						cancelCallback();
						self.resetPromptAndCallback();
					}
				});
			}
		}
		
		
		/**
		 *
		 * loads the google maps api object
		 *
		 */
		function loadGoogleMapsAPI() {
			
			if (self.$isLoaded) {
				return;
			}
			/*
			 * Gmaps loaded callback
			 */
			self.setupGoogleMapsLoadedCallback();
			
			//Create a script element to insert into the page
			self.insertGoogleMapsAPIScriptTag();
		}
		
		/**
		 *
		 * register a callback for when the maps have loaded
		 *
		 */
		function setupGoogleMapsLoadedCallback() {
			$window.mapInit = function () {
				self.$isLoaded = true;
				self.api = ($window.google || {});
				
				/*
				 * Close the prompt and trigger callback if successful
				 */
				if (self.$$prompt !== null && self.$$prompt.close) {
					self.$$prompt.close();
				}
				if (self.$$promptCallback !== null) {
					self.$$promptCallback();
				}
				self.resetPromptAndCallback();
				
			};
		}
		
		/**
		 *
		 * Add a script tag for google maps
		 *
		 */
		function insertGoogleMapsAPIScriptTag() {
			var script = document.createElement("script"),
				API_KEY = "AIzaSyAaAgNcYgRzVlSVKjH2bFOMeaWqlj_Po_w";
			script.type = "text/javascript";
			
			//Note the callback on the end
			script.src = "http://maps.google.com/maps/api/js?key=" + API_KEY + "&sensor=true&callback=mapInit";
			
			document.body.appendChild(script);
		}
		
	}
	
})();

