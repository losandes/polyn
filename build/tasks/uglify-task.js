/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-uglify'); // node

    // Update the grunt config
    grunt.config.set('uglify', {
        debug: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                beautify: true,
                mangle: false,
                compress: false,
                sourceMap: false,
                drop_console: false,
                preserveComments: 'some'
            },
            files: {
                '../release/polyn.js': ['../src/Blueprint.js', '../src/exceptions.js', '../src/id.js', '../src/is.js', '../src/utils.js']
            }
        },
        release: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                    //                    mangle: true,
                    //                    compress: true,
                    //                    sourceMap: true,
                    //                    drop_console: true
            },
            files: {
                '../release/polyn.min.js': ['../src/Blueprint.js', '../src/exceptions.js', '../src/id.js', '../src/is.js', '../src/utils.js']
            }
        }
    });
};
