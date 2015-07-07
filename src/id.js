
/*jshint bitwise: false*/
/*globals Hilary, Window*/
(function (scope) {
    'use strict';

    var definition = {
        name: 'polyn.id',
        dependencies: [],
        factory: undefined
    };

    definition.factory = function () {
        var self = {
                createUid: undefined,
                createGuid: undefined
            },
            createRandomString;
        
        createRandomString = function (templateString) {
            return templateString.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : r & 3 | 8;
                return v.toString(16);
            });
        };
        
        self.createUid = function (length) {
            var template;
            
            length = length || 12;
            template = new Array(length + 1).join('x');
            
            return createRandomString(template);
        };
        
        self.createGuid = function () {
            return createRandomString('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
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
