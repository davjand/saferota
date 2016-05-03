(function () {
	'use strict';

	angular
		.module('saferota.core')
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
					id: '',
					firstName: '',
					lastName: '',
					username: ''
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

