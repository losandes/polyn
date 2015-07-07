/*globals Hilary, Window*/
(function (scope) {
    'use strict';

    var definition = {
        name: 'polyn.is',
        dependencies: [],
        factory: undefined
    };

    definition.factory = function () {
        var self = {
                getType: undefined,
                defined: undefined,
                nullOrUndefined: undefined,
                function: undefined,
                object: undefined,
                array: undefined,
                string: undefined,
                boolean: undefined,
                datetime: undefined,
                regexp: undefined,
                number: undefined,
                nullOrWhitespace: undefined,
                money: undefined,
                decimal: undefined,
                Window: undefined,
                not: {
                    defined: undefined,
                    function: undefined,
                    object: undefined,
                    array: undefined,
                    string: undefined,
                    boolean: undefined,
                    datetime: undefined,
                    regexp: undefined,
                    number: undefined,
                    nullOrWhitespace: undefined,
                    money: undefined,
                    decimal: undefined,
                    Window: undefined
                }
            },
            class2Types = {},
            class2ObjTypes = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object'],
            i,
            name;

        for (i = 0; i < class2ObjTypes.length; i += 1) {
            name = class2ObjTypes[i];
            class2Types['[object ' + name + ']'] = name.toLowerCase();
        }

        self.getType = function (obj) {
            if (typeof obj === 'undefined') {
                return 'undefined';
            }

            if (obj === null) {
                return String(obj);
            }

            return typeof obj === 'object' || typeof obj === 'function' ?
                class2Types[Object.prototype.toString.call(obj)] || 'object' :
                typeof obj;
        };

        self.defined = function (obj) {
            try {
                return self.getType(obj) !== 'undefined';
            } catch (e) {
                return false;
            }
        };
        
        self.not.defined = function (obj) {
            return self.defined(obj) === false;
        };
        
        self.nullOrUndefined = function (obj) {
            return self.not.defined(obj) || obj === null;
        };
        
        self.not.nullOrWhitespace = function (str) {
            if (typeof str === 'undefined' || typeof str === null || self.not.string(str)) {
                return false;
            }
            
            // ([^\s]*) = is not whitespace
            // /^$|\s+/ = is empty or whitespace

            return (/([^\s])/).test(str);
        };

        self.nullOrWhitespace = function (str) {
            return self.not.nullOrWhitespace(str) === false;
        };
        
        self.function = function (obj) {
            return self.getType(obj) === 'function';
        };
        
        self.not.function = function (obj) {
            return self.function(obj) === false;
        };
        
        self.object = function (obj) {
            return self.getType(obj) === 'object';
        };
        
        self.not.object = function (obj) {
            return self.object(obj) === false;
        };
        
        self.array = function (obj) {
            return self.getType(obj) === 'array';
        };
        
        self.not.array = function (obj) {
            return self.array(obj) === false;
        };
        
        self.string = function (obj) {
            return self.getType(obj) === 'string';
        };
        
        self.not.string = function (obj) {
            return self.string(obj) === false;
        };
        
        self.boolean = function (obj) {
            return self.getType(obj) === 'boolean';
        };
        
        self.not.boolean = function (obj) {
            return self.boolean(obj) === false;
        };
        
        self.datetime = function (obj) {
            return self.getType(obj) === 'date';
        };
        
        self.not.datetime = function (obj) {
            return self.datetime(obj) === false;
        };
        
        self.regexp = function (obj) {
            return self.getType(obj) === 'regexp';
        };
        
        self.not.regexp = function (obj) {
            return self.regexp(obj) === false;
        };
        
        self.number = function (obj) {
            return self.getType(obj) === 'number';
        };
        
        self.not.number = function (obj) {
            return self.number(obj) === false;
        };

        self.money = function (val) {
            return self.defined(val) && (/^(?:-)?[0-9]\d*(?:\.\d{0,2})?$/).test(val.toString());
        };
        
        self.not.money = function (val) {
            return self.money(val) === false;
        };
        
        self.decimal = function (num, places) {
            if (self.not.number(num)) {
                return false;
            }
            
            if (!places && self.number(num)) {
                return true;
            }
            
            if (!num || +(+num || 0).toFixed(places) !== +num) {
                return false;
            }
            
            return true;
        };
        
        self.not.decimal = function (val) {
            return self.decimal(val) === false;
        };
        
        self.Window = function (obj) {
            return self.is.defined(Window) && obj instanceof Window;
        };
        
        self.not.Window = function (obj) {
            return self.is.Window(obj) === false;
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
