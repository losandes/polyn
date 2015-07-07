/*jslint node: true*/
/*
// This file is the main entry point for defining grunt tasks and using grunt plugins.
// Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    "use strict";
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });
    
    grunt.loadTasks('tasks');

    // Default task(s).
    grunt.registerTask('default', ['mochaTest:main']);
    grunt.registerTask('test', ['mochaTest:main']);
};
