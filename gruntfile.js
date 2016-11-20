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

    grunt.registerTask('test', ['build', 'mochaTest:main', 'karma:unit_' + os]);
    grunt.registerTask('test-node', ['mochaTest:main']);
    grunt.registerTask('test-browser', ['build', 'karma:unit_' + os]);
    grunt.registerTask('debug', ['build', 'karma:debug_' + os]);
    grunt.registerTask('debug-browser', ['build', 'karma:debug_' + os]);

    grunt.registerTask('build', ['uglify:debug', 'uglify:release']);
};
