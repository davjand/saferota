(function () {
	'use strict';

	angular
		.module('saferota.auth')
		.factory('User', User);

	User.$inject = [];

	/* @ngInject */
	function User() {

		/*

		 user model object

		 */
		var factory = function (options) {
			options = options || {};

			var self = this,
				defaults = {
					firstName: '',
					lastName: '',
					email: ''
				};
			angular.extend(defaults, options);
			angular.extend(self, defaults);
		};

		//Functions
		factory.prototype.getFullName = getFullName;


		return factory;

		////////////////

		function getFullName() {
			/*jshint validthis:true */
			var self = this;
			return self.firstName + ' ' + self.lastName;
		}
	}

})();

