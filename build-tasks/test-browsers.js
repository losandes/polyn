/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    var makeFileArray = function (minified) {
        var polyn = minified ? 'release/polyn.min.js' : 'release/polyn.js';
        return [
            'tests/browser-setup.js',
            // polyn
            polyn,
            // specs
            'tests/specs/async.fixture.js',
            'tests/specs/Blueprint.fixture.js',
            'tests/specs/Exception.fixture.js',
            'tests/specs/id.fixture.js',
            'tests/specs/Immutable.fixture.js',
            'tests/specs/is.fixture.js',
            'tests/specs/objectHelper.fixture.js',
            // runner
            'tests/browser-bootstrapper.js'
        ];
    };

    grunt.loadNpmTasks('grunt-mocha'); // browser
    grunt.loadNpmTasks('grunt-karma');

    // Update the grunt config
    grunt.config.set('karma', {
        options: {
            // see http://karma-runner.github.io/0.8/config/configuration-file.html
            basePath: './',
            frameworks: ['mocha', 'chai'],
            files: makeFileArray(false),
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
