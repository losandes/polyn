/*globals Hilary, Window*/
(function (scope) {
    'use strict';

    var definition = {
        name: 'polyn.exceptions',
        dependencies: ['polyn.is'],
        factory: undefined
    };
    
    definition.factory = function (is) {
        return function (exceptionHandler) {
            var self = {
                    makeException: undefined,
                    makeArgumentException: undefined,
                    makeNotImplementedException: undefined,
                    throwException: undefined
                };

            self.makeException = function (name, message, data) {
                var msg,
                    err;

                if (typeof name === 'object' && typeof name.message === 'string') {
                    // The name argument probably received an Error object
                    msg = name.message;
                    err = name;
                } else {
                    msg = typeof message === 'string' ? message : name;
                    err = new Error(msg);
                }

                err.message = msg;

                if (name !== msg) {
                    err.name = name;
                }

                if (data) {
                    err.data = data;
                }

                return err;
            };

            self.makeArgumentException = function (message, argument, data) {
                var msg = typeof argument === 'undefined' ? message : message + ' (argument: ' + argument + ')';
                return self.makeException('ArgumentException', msg, data);
            };

            self.makeNotImplementedException = function (message, data) {
                return self.makeException('NotImplementedException', message, data);
            };

            self.throwException = function (exception) {
                if (is.function(exceptionHandler)) {
                    exceptionHandler(exception);
                } else {
                    console.error(exception);
                    throw exception;
                }
            };

            return self;
        };
    };
    
    if (typeof Window !== 'undefined' && scope instanceof Window) {
        scope[definition.name] = definition.factory;
    } else if (typeof scope.register === 'function') {
        scope.register(definition);
    } else {
        scope.name = definition.name;
        scope.dependencies = definition.dependencies;
        scope.factory = definition.factory;
    }
    
}((typeof module !== 'undefined' && module.exports) ? module.exports : ((Hilary && Hilary.scope) ? Hilary.scope('polyn') : window)));
