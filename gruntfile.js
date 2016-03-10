module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-injector');
	grunt.loadNpmTasks('grunt-wiredep');

	//noinspection JSUnresolvedFunction
	grunt.initConfig({
		injector: {
			options: {
				ignorePath: 'www'
			},
			local: {
				files: {
					'www/index.html': ['www/app/**/*module.js','www/app/**/*.js', '!www/app/**/*.spec.js']
				}
			}
		},

		wiredep: {
			task: {
				src: 'www/index.html',
				options: {
					exclude: [
						'lib/angular-mocks/angular-mocks.js',
						'lib/angular/angular.js'
					],
				}
			}

		}
	});


	/*

	 TASKS
	 --------------

	 grunt injector
	 Injects all js into index.html

	 grunt wiredep
	 Injects all bower dependencies

	 */

	grunt.task.registerTask('default', ['injector', 'wiredep']);
};