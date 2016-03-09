module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-injector');

	grunt.initConfig({
		injector: {
			options: {
				ignorePath: 'www/'
			},
			local: {
				files: {
					'www/index.html': ['www/js/**/*.js', '!www/js/**/*.spec.js']
				}
			}
		}
	});


	/*

	 TASKS
	 --------------

	 grunt injector
	 Injects all js into index.html

	 */
};