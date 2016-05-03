// Karma configuration
// Generated on Wed Mar 09 2016 13:58:05 GMT+0000 (GMT)

module.exports = function (config) {
	'use strict';

	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['wiredep', 'jasmine'],


		wiredep: {
			dependencies: true,    // default: true
			devDependencies: true, // default: false
			exclude: []
			//overrides: []
		},

		plugins: [
			'karma-wiredep',
			'karma-jasmine',
			'karma-chrome-launcher',
			'karma-phantomjs-launcher',
			'karma-coverage',
			'karma-ng-html2js-preprocessor'],

		// list of files / patterns to load in the browser
		files: [
			'www/lib/ionic/js/ionic.bundle.js',
			'www/lib/angular-mocks/angular-mocks.js',


			/*'www/lib/ngCordova/dist/ng-cordova.js',
			 'www/lib/ngCordova/dist/ng-cordova-mocks.js',
			 'www/lib/ladda/dist/spin.min.js',
			 'www/lib/ladda/dist/ladda.min.js',
			 'www/lib/angular-ladda/dist/angular-ladda.min.js',
			 'www/lib/angularbknd-sdk/dist/backand.min.js',
			 'www/lib/moment/min/moment.min.js',
			 'www/lib/angular-cache/dist/angular-cache.js',*/

			'www/app/**/*.module.js',
			'www/app/**/*.js',
			'www/app/**/*.html'
		],


		// list of files to exclude
		exclude: [],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'www/app/**/!(*spec).js': ['coverage'],
			'www/app/**/*.html': ['ng-html2js']
		},

		//Preprocess
		ngHtml2JsPreprocessor: {
			// strip this from the file path
			stripPrefix: 'www/'
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN ||
		// config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['PhantomJS'],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	});
};