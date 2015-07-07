/*jshint bitwise: false*/
/*globals Hilary, Window*/
(function (scope) {
    'use strict';

    var definition = {
        name: 'utils',
        dependencies: ['is'],
        factory: undefined
    };

    definition.factory = function (is) {
        var self = {
            runAsync: undefined
        };

        self.runAsync = function (func, highPriority) {
            if (highPriority === true && is.defined(process) && is.function(process.nextTick)) {
                process.nextTick(func);
            } else if (setImmediate) {
                setImmediate(func);
            } else {
                setTimeout(func, 0);
            }
        };

        return self;
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
