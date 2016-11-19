module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

    grunt.loadTasks('build-tasks');

    // Default task(s).
    grunt.registerTask('default', ['help']);
    grunt.registerTask('test', ['mochaTest:main']);
    grunt.registerTask('build', ['uglify:debug', 'uglify:release']);
};
