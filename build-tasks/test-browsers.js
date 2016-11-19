/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-mocha'); // browser
    grunt.loadNpmTasks('grunt-karma');

    // Update the grunt config
    grunt.config.set('karma', {
        options: {
            // see http://karma-runner.github.io/0.8/config/configuration-file.html
            basePath: './',
            frameworks: ['mocha', 'chai'],
            files: [
                'tests/browser-setup.js',
                // polyn
                'release/polyn.js',
                // specs
                'tests/specs/async.fixture.js',
                'tests/specs/Blueprint.fixture.js',
                'tests/specs/Exception.fixture.js',
                'tests/specs/id.fixture.js',
                'tests/specs/is.fixture.js',
                // runner
                'tests/browser-bootstrapper.js'
            ],
            reporters: ['nyan'],
            reportSlowerThan: 2000,
            singleRun: true
        },
        // developer testing mode
        unit_osx: {
            browsers: ['Chrome', 'Firefox', 'Safari']
        },
        debug_osx: {
            browsers: ['Chrome'],
            singleRun: false
        },
        unit_windows: {
            browsers: ['Chrome', 'Firefox', 'IE']
        },
        debug_windows: {
            browsers: ['Chrome'],
            singleRun: false
        },
        //continuous integration mode: run tests once in PhantomJS browser.
        unit_headless: {
            singleRun: true,
            browsers: ['PhantomJS']
        }
    });
};
