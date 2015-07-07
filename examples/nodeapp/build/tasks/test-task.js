/*jslint node: true*/
module.exports = function (grunt) {
    "use strict";
    
    var mochaConfig;
    
    grunt.loadNpmTasks('grunt-mocha-test'); // node
    
    // Update the grunt config
    grunt.config.set('mochaTest', {
        main: {
            options: {
                reporter: 'nyan', // 'spec', // 'min', // 'nyan', // 'xunit',
                quiet: false // Optionally suppress output to standard out (defaults to false)
                //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                //clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
            },
            require: 'coverage/blanket',
            src: ['../tests/*.fixture.js', '../tests/specs/**/*.fixture.js']
        },
        coverage: {
            options: {
                reporter: 'html-cov',
                // use the quiet flag to suppress the mocha console output
                quiet: true,
                // specify a destination file to capture the mocha
                // output (the quiet option does not suppress this)
                captureFile: 'coverage.html'
            },
            src: ['../tests/**/*.fixture.js']
        }
    });
};
