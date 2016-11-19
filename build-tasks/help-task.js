var chalk = require('chalk');

module.exports = function (grunt) {
    'use strict';

    var printDefinition,
        printHeader,
        printExample;

    printDefinition = function (name, definition, switchList) {
        if (switchList) {
            console.log(chalk.bold.blue(name), chalk.white(definition) + chalk.italic.magenta(' ' + switchList));
        } else {
            console.log(chalk.bold.blue(name), chalk.white(definition));
        }
    };

    printHeader = function (header) {
        console.log(chalk.bold.bgYellow.black(header));
    };

    printExample = function (example) {
        console.log(chalk.white(example));
    };

    grunt.registerTask('help', 'prints out the grunt tasks that are registered', function () {
        console.log('');
        printHeader('Legend');
        printDefinition('command', 'definition/explanation/behavior', 'supported switches');
        console.log('');

        printHeader('Test/Lint Commands');
        printDefinition('grunt test', 'Runs all developer tests (server and client)', '-os');
        printDefinition('test-node', 'Run all node developer tests');
        printDefinition('test-browser', 'Run all browser tests', '-os');
        printDefinition('debug-browser', 'Run all browser tests in debug mode');
        // printDefinition('grunt lint', 'Runs linters on all files');
        // printDefinition('grunt pr-check', 'Runs linters and tests on all files and displays a PR checklist', '-os');
        console.log('');

        printHeader('Test/Lint Switches');
        printDefinition('-os', 'When running tests, you can choose which os you are using to get a different set of browsers.');
        printDefinition('-os osx', '(default) runs the browser tests in Chrome, Firefox and Safari (same as ``grunt karma:learn-unit-osx``)');
        printDefinition('-os win', 'runs the browser tests in Chrome, Firefox and IE (same as ``grunt karma:learn-unit-win``)');
        printDefinition('-os headless', 'runs the browser tests in PhantomJS (same as ``grunt karma:learn-unit-headless``)');
        console.log('');
        printDefinition('example for osx', '``$ grunt test-browser``');
        printDefinition('example for headless', '``$ grunt test-browser -os headless``');
        console.log('');

        printHeader('Build Commands');
        printDefinition('grunt build', 'Tests the code, then uglifies the source into the release folder');
        console.log('');
    });
};
