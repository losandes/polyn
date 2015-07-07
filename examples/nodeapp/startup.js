'use strict';

// All app variables are defined in start and compose.
// By isolating the app's requirements into the start and compose functions,
// The entire app can be restarted from within, to react to failure, and to
// get into a clean running state when associated services recover from failure.
var Hilary = require('hilary'),
    scope,
    compose,
    start;

/*
// Orchestrates composition of the application dependency graph
*/
compose = function (onReady) {
    var polyn = require('polyn'),
        IFooBlueprint = require('./IFooBlueprint.js'),
        foo = require('./foo.js');

    scope.autoRegister(polyn);
    scope.register(IFooBlueprint);
    scope.register(foo);

    scope.resolve('IFooBlueprint').signatureMatches(scope.resolve('foo'), function (err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log('foo implements IFooBlueprint: ', result);
            
            scope.register({
                name: 'IFoo',
                factory: function () {
                    return scope.resolve('foo');
                }
            });
            
            onReady();
        }
    });
    
};

/*
// Orchestrates startup
*/
start = function () {
    scope = Hilary.scope('polyn-example');

    console.log('startup::@' + new Date().toISOString());
    console.log('startup::composing application');

    // compose the application dependency graph
    compose(function () {
        console.log(scope.resolve('IFoo'));
    });
};

// !!!!!!!!!!!!!!!!!!!!!!!!!
// START NOW
start();
