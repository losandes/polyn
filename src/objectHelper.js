/*jshint -W061*/ // (eval)
(function () {
    'use strict';

    var objectHelper = ObjectHelper(),
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        ARGUMENT_NAMES = /([^\s,]+)/g,
        FUNCTION_TEMPLATE = 'newFunc = function ({{args}}) { return that.apply(that, arguments); }';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = objectHelper;
    } else if (window) {
        window.polyn = window.polyn || {};
        Object.defineProperty(window.polyn, 'objectHelper', {
            get: function () {
                return objectHelper;
            },
            set: function () {
                var err = new Error('[POLYN] polyn modules are read-only');
                console.log(err);
                return err;
            },
            // this property should show up when this object's property names are enumerated
            enumerable: true,
            // this property may not be deleted
            configurable: false
        });
    } else {
        console.log('[POLYN] Unable to define module: UNKNOWN RUNTIME');
    }

    /*
    // objectHelper
    */
    function ObjectHelper () {
        var self = {};

        /*
        // Adds a read-only property to the given object
        // @param obj: the object we are adding the property to
        // @param name: the name of the property
        // @param val: the value of the property
        // @param onError: a handler that is called when a caller tries to set the value of this property
        */
        function setReadOnlyProperty (obj, name, val, onError) {
            var defaultErrorMessage = 'the {{name}} property is read-only'
                .replace(/{{name}}/, name);

            Object.defineProperty(obj, name, {
                get: function () {
                    return val;
                },
                set: function () {
                    if (typeof onError === 'function') {
                        return onError(defaultErrorMessage);
                    }

                    var err = new Error(defaultErrorMessage);
                    console.log(err);
                    return err;
                },
                // this property should show up when this object's property names are enumerated
                enumerable: true,
                // this property may not be deleted
                configurable: false
            });
        }

        /*
        // Make a copy of a value, ensuring it's not a reference
        // @param val: The value to get a copy of
        */
        function copyValue (val) {
            if (!val) {
                return val;
            }

            if (isDate(val)) {
                // the best way to clone a date, is to create a new Date from it
                return new Date(val);
            } else if (isFunction(val)) {
                return copyFunction(val);
            } else if (isObject(val)) {
                return cloneObject(val, true);
            } else {
                return JSON.parse(JSON.stringify(val));
            }
        }

        /*
        // Make a copy of a function, ensuring it's not a reference
        // @param func: The function to get a copy of
        */
        function copyFunction (func) {
            var newFunc, that, prop;

            if (typeof func !== 'function') {
                return func;
            }

            that = func.__clonedFrom || func;

            // This is a safe use of eval - we're not executing the function
            // itself, rather creating a clone that calls the original, and
            // maintaining the argument names. This approach will pass
            // Blueprint validation, remove direct access to the original
            // function, and maintain scope.
            eval(FUNCTION_TEMPLATE
                    .replace(/{{args}}/, getArgumentNames(func).join(', '))
            );

            for(prop in that) {
                if (that.hasOwnProperty(prop)) {
                    newFunc[prop] = copyValue(that[prop]);
                }
            }

            newFunc.__clonedFrom = that;

            return newFunc;
        }

        /*
        // Gets the argument names from a function and returns them in an array
        // @param func: The function to get the argument names for
        */
        function getArgumentNames (func) {
            var functionTxt, result;

            if (typeof func !== 'function') {
                return [];
            }

            functionTxt = func.toString().replace(STRIP_COMMENTS, '');
            result = functionTxt.slice(functionTxt.indexOf('(') + 1, functionTxt.indexOf(')'))
                .match(ARGUMENT_NAMES);

            if (result === null) {
                result = [];
            }

            return result;
        }

        /*
        // Copies the values of an Immutable to a plain JS Object
        // @param from: The Immutable to copy
        // @param deep (default: true): Whether or not to recurse when objects are found
        */
        function cloneObject (from, deep) {
            var newVals = {},
                propName;

            if (typeof deep === 'undefined') {
                deep = true;
            }

            for (propName in from) {
                if (!from.hasOwnProperty(propName)) {
                    continue;
                }

                if (deep && isObject(from[propName]) && !isDate(from[propName])) {
                    // this is a deep clone, and we encountered an object - recurse
                    newVals[propName] = cloneObject(from[propName]);
                } else if (!deep && isObject(from[propName]) && !isDate(from[propName])) {
                    // this is NOT a deep clone, and we encountered an object that is NOT a date
                    newVals[propName] = null;
                } else {
                    newVals[propName] = copyValue(from[propName], newVals);
                }
            }

            return newVals;
        } // /toObject

        /*
        // Makes a new Object from an existing Immutable, replacing
        // values with the properties in the mergeVals argument
        // NOTE: This does not return an Immutable!
        // @param from: The Immutable to copy
        // @param mergeVals: The new values to overwrite as we copy
        */
        function merge (from, mergeVals) {
            var newVals = objectHelper.cloneObject(from),
                propName;

            for (propName in mergeVals) {
                if (!mergeVals.hasOwnProperty(propName)) {
                    continue;
                }

                if (isObject(mergeVals[propName]) && !isDate(mergeVals[propName])) {
                    newVals[propName] = merge(from[propName], mergeVals[propName]);
                } else {
                    newVals[propName] = mergeVals[propName];
                }
            }

            return newVals;
        } // /merge

        function isDate (val) {
            return typeof val === 'object' &&
                Object.prototype.toString.call(val) === '[object Date]';
        }

        function isFunction (val) {
            return typeof val === 'function';
        }

        function isObject (val) {
            return typeof val === 'object';
        }

        setReadOnlyProperty(self, 'setReadOnlyProperty', setReadOnlyProperty);
        setReadOnlyProperty(self, 'copyValue', copyValue);
        setReadOnlyProperty(self, 'cloneObject', cloneObject);
        setReadOnlyProperty(self, 'merge', merge);
        setReadOnlyProperty(self, 'getArgumentNames', getArgumentNames);

        return self;
    }

}());
