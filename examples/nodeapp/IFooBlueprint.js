/*jslint node: true*/
module.exports.name = 'IFooBlueprint';
module.exports.dependencies = ['Blueprint'];
module.exports.factory = function (Blueprint) {
    'use strict';
    
    var IFoo = {
            signatureMatches: undefined
        },
        blueprint;
    
    blueprint = new Blueprint({
        num: 'number',
        str: 'string',
        arr: 'array',
        currency: 'money',
        bool: 'bool',
        date: 'datetime',
        regex: 'regexp',
        obj: 'object',
        func: {
            type: 'function',
            args: ['arg1', 'arg2']
        },
        dec: {
            type: 'decimal',
            places: 2
        }
    });
    
    IFoo.signatureMatches = function (implementation, callback) {
        blueprint.signatureMatches(implementation, function (err, result) {
            callback(err, result);
        });
    };
    
    return IFoo;
};
