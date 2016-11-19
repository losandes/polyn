module.exports = function (grunt) {
    'use strict';

    // arguments
    var os = grunt.option('os') || 'osx';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

    grunt.loadTasks('build-tasks');

    // Default task(s).
    grunt.registerTask('default', ['help']);

    grunt.registerTask('test', ['mochaTest:main', 'karma:unit_' + os]);
    grunt.registerTask('test-node', ['mochaTest:main']);
    grunt.registerTask('test-browser', ['karma:unit_' + os]);
    grunt.registerTask('debug', ['karma:debug_' + os]);
    grunt.registerTask('debug-browser', ['karma:debug_' + os]);

    grunt.registerTask('build', ['test', 'uglify:debug', 'uglify:release']);
};
