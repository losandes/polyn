/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    var banner = '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        files = [
            './src/polyn-browser.js',
            './src/Exception.js',
            './src/async.js',
            './src/objectHelper.js',
            './src/id.js',
            './src/is.js',
            './src/Blueprint.js',
            './src/Immutable.js'
        ],
        output = {
            './release/polyn.js': files
        },
        outputMinified = {
            './release/polyn.min.js': files
        };

    grunt.loadNpmTasks('grunt-contrib-uglify'); // node

    // Update the grunt config
    grunt.config.set('uglify', {
        debug: {
            options: {
                banner: banner,
                beautify: true,
                mangle: false,
                compress: false,
                sourceMap: false,
                drop_console: false,
                preserveComments: 'some'
            },
            files: output
        },
        release: {
            options: {
                banner: banner
                // mangle: true,
                // compress: true,
                // sourceMap: true,
                // drop_console: true
            },
            files: outputMinified
        }
    });
};
