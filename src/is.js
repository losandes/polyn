(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = new Is();
    } else if (window && window.polyn) {
        window.polyn.addModule('is', null, Is);
    } else {
        console.log(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME or POLYN NOT DEFINED'));
    }

    /*
    // is
    */
    function Is () {
        var is = {
                getType: undefined,
                defined: undefined,
                nullOrUndefined: undefined,
                function: undefined,
                object: undefined,
                array: undefined,
                string: undefined,
                bool: undefined,
                boolean: undefined,
                date: undefined,
                datetime: undefined,
                regexp: undefined,
                number: undefined,
                nullOrWhitespace: undefined,
                money: undefined,
                decimal: undefined,
                Window: undefined,
                ObjectID: undefined,
                not: {
                    defined: undefined,
                    function: undefined,
                    object: undefined,
                    array: undefined,
                    string: undefined,
                    bool: undefined,
                    boolean: undefined,
                    date: undefined,
                    datetime: undefined,
                    regexp: undefined,
                    number: undefined,
                    nullOrWhitespace: undefined,
                    money: undefined,
                    decimal: undefined,
                    Window: undefined,
                    ObjectID: undefined
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

        is.getType = function (obj) {
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

        is.defined = function (obj) {
            try {
                return is.getType(obj) !== 'undefined';
            } catch (e) {
                return false;
            }
        };

        is.not.defined = function (obj) {
            return is.defined(obj) === false;
        };

        is.nullOrUndefined = function (obj) {
            return is.not.defined(obj) || obj === null;
        };

        is.not.nullOrWhitespace = function (str) {
            if (typeof str === 'undefined' || typeof str === null || is.not.string(str)) {
                return false;
            }

            // ([^\s]*) = is not whitespace
            // /^$|\s+/ = is empty or whitespace

            return (/([^\s])/).test(str);
        };

        is.nullOrWhitespace = function (str) {
            return is.not.nullOrWhitespace(str) === false;
        };

        is.function = function (obj) {
            return is.getType(obj) === 'function';
        };

        is.not.function = function (obj) {
            return is.function(obj) === false;
        };

        is.object = function (obj) {
            return is.getType(obj) === 'object';
        };

        is.not.object = function (obj) {
            return is.object(obj) === false;
        };

        is.array = function (obj) {
            return is.getType(obj) === 'array';
        };

        is.not.array = function (obj) {
            return is.array(obj) === false;
        };

        is.string = function (obj) {
            return is.getType(obj) === 'string';
        };

        is.not.string = function (obj) {
            return is.string(obj) === false;
        };

        is.bool = function (obj) {
            return is.getType(obj) === 'boolean';
        };

        is.not.bool = function (obj) {
            return is.boolean(obj) === false;
        };

        is.boolean = function (obj) {
            return is.getType(obj) === 'boolean';
        };

        is.not.boolean = function (obj) {
            return is.boolean(obj) === false;
        };

        is.datetime = function (obj) {
            return  is.getType(obj) === 'date' &&
                    is.function(obj.getTime) &&
                    !isNaN(obj.getTime());
        };

        is.not.datetime = function (obj) {
            return is.datetime(obj) === false;
        };

        is.date = is.datetime;
        is.not.date = is.not.datetime;

        is.regexp = function (obj) {
            return is.getType(obj) === 'regexp';
        };

        is.not.regexp = function (obj) {
            return is.regexp(obj) === false;
        };

        is.number = function (obj) {
            return is.getType(obj) === 'number';
        };

        is.not.number = function (obj) {
            return is.number(obj) === false;
        };

        is.money = function (val) {
            return is.defined(val) && (/^(?:-)?[0-9]\d*(?:\.\d{0,2})?$/).test(val.toString());
        };

        is.not.money = function (val) {
            return is.money(val) === false;
        };

        is.decimal = function (num, places) {
            if (is.not.number(num)) {
                return false;
            }

            if (!places && is.number(num)) {
                return true;
            }

            if (!num || +(+num || 0).toFixed(places) !== +num) {
                return false;
            }

            return true;
        };

        is.not.decimal = function (val) {
            return is.decimal(val) === false;
        };

        is.Window = function (obj) {
            return is.defined(Window) && obj instanceof Window;
        };

        is.not.Window = function (obj) {
            return is.Window(obj) === false;
        };

        is.ObjectID = function (obj) {            
            return is.defined(obj) && obj._bsontype === 'ObjectID';
        };

        is.not.ObjectID = function (obj) {
            return is.ObjectID(obj) === false;
        };

        return is;
    }



}());
