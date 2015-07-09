'use strict';

// All app variables are defined in start and compose.
// By isolating the app's requirements into the start and compose functions,
// The entire app can be restarted from within, to react to failure, and to
// get into a clean running state when associated services recover from failure.
var Hilary = require('hilary'),
    hilaryPolyn = require('./hilary.polyn.js'),
    scope,
    compose,
    start;

/*
// Orchestrates composition of the application dependency graph
*/
compose = function () {
    var polyn = require('../../index.js'),
        IFooBlueprint = require('./IFooBlueprint.js'),
        foo = require('./foo.js');

    scope.autoRegister(polyn);
    scope.register(IFooBlueprint);
    scope.register(foo);

    scope.registerBlueprint('IFoo', 'IFooBlueprint', 'foo');
    
};

/*
// Orchestrates startup
*/
start = function () {
    hilaryPolyn.usePolyn(Hilary);
    scope = Hilary.scope('polyn-example');

    console.log('startup::@' + new Date().toISOString());
    console.log('startup::composing application');

    // compose the application dependency graph
    compose();
    
    console.log(scope.resolve('IFoo'));
};

// !!!!!!!!!!!!!!!!!!!!!!!!!
// START NOW
start();
