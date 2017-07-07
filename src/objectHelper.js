/*jshint -W061*/ // (eval)
(function () {
    'use strict';

    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        ARGUMENT_NAMES = /([^\s,]+)/g,
        FUNCTION_TEMPLATE = 'newFunc = function ({{args}}) { return that.apply(that, arguments); }',
        locale = {
            errorTypes: {
                invalidArgumentException: 'InvalidArgumentException'
            },
            errors: {
                cannotCopyFunction: 'Valid values for the function argument are a function, null, or undefined'
            }
        };

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = new Factory({
            async: require('./async.js')
        });
    } else if (window && window.polyn) {
        window.polyn.addModule('objectHelper', ['async'], Factory);
    } else {
        console.log(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME or POLYN NOT DEFINED'));
    }

    function Factory (polyn) {
        return new ObjectHelper(polyn.async);
    }

    /*
    // objectHelper
    */
    function ObjectHelper (async) {
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
            try {
                if (isDate(val)) {
                    // the best way to clone a date, is to create a new Date from it
                    return new Date(val);
                } else if (isFunction(val)) {
                    return copyFunction(val);
                } else if (isRegex(val)) {
                    return new RegExp(val);
                } else if (isObject(val) && !Array.isArray(val)) {
                    return syncCloneObject(val, true);
                } else {
                    return JSON.parse(JSON.stringify(val));
                }
            } catch (e) {
                return {
                    type: locale.errorTypes.invalidArgumentException,
                    error: e,
                    messages: [e.message],
                    isException: true
                };
            }
        }

        /*
        // Make a copy of a function, ensuring it's not a reference
        // @param func: The function to get a copy of
        */
        function copyFunction (func) {
            var newFunc, that, prop;

            if (func && typeof func !== 'function') {
                return {
                    type: locale.errorTypes.invalidArgumentException,
                    error: new Error(locale.errors.cannotCopyFunction),
                    messages: [locale.errors.cannotCopyFunction],
                    isException: true
                };
            } else if (!func) {
                return func;
            }

            that = func.__clonedFrom || func;

            // This is a safe use of eval - we're not executing the function
            // itself, rather creating a new function that calls the original,
            // and maintaining the argument names. This approach will pass
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
        // @param callback: Optional async API
        */
        function getArgumentNames (func, callback) {
            if (typeof callback === 'function') {
                async.runAsync(function () {
                    var args = syncGetArgumentNames(func);

                    if (args.isException) {
                        callback(args);
                    } else {
                        callback(null, args);
                    }
                });
            } else {
                return syncGetArgumentNames(func);
            }
        }

        /*
        // Gets the argument names from a function and returns them in an array
        // @param func: The function to get the argument names for
        */
        function syncGetArgumentNames (func) {
            var functionTxt, result;

            if (func && typeof func !== 'function') {
                return {
                    type: locale.errorTypes.invalidArgumentException,
                    error: new Error(locale.errors.cannotCopyFunction),
                    messages: [locale.errors.cannotCopyFunction],
                    isException: true
                };
            } else if (!func) {
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
        // @param callback: Optional async API
        */
        function cloneObject (from, deep, callback) {
            if (typeof callback === 'function') {
                async.runAsync(function () {
                    var cloned = syncCloneObject(from, deep);

                    if (cloned.isException) {
                        callback(cloned);
                    } else {
                        callback(null, cloned);
                    }
                });
            } else {
                return syncCloneObject(from, deep);
            }
        }

        /*
        // Copies the values of an Immutable to a plain JS Object
        // @param from: The Immutable to copy
        // @param deep (default: true): Whether or not to recurse when objects are found
        */
        function syncCloneObject (from, deep) {
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
                    newVals[propName] = syncCloneObject(from[propName]);
                } else if (!deep && isObject(from[propName]) && !isDate(from[propName])) {
                    // this is NOT a deep clone, and we encountered an object that is NOT a date
                    newVals[propName] = null;
                } else {
                    newVals[propName] = copyValue(from[propName], newVals);
                }

                if (newVals[propName] && newVals[propName].isException) {
                    // stop processing on exception
                    return newVals[propName];
                }
            }

            return newVals;
        } // /syncCloneDate

        /*
        // Makes a new Object from an existing Immutable, replacing
        // values with the properties in the mergeVals argument
        // NOTE: This does not return an Immutable!
        // @param from: The Immutable to copy
        // @param mergeVals: The new values to overwrite as we copy
        // @param callback: Optional async API
        */
        function merge (from, mergeVals, callback) {
            if (typeof callback === 'function') {
                async.runAsync(function () {
                    var merged = syncMerge(from, mergeVals);

                    if (merged.isException) {
                        callback(merged);
                    } else {
                        callback(null, merged);
                    }
                });
            } else {
                return syncMerge(from, mergeVals);
            }
        }

        /*
        // Makes a new Object from an existing Immutable, replacing
        // values with the properties in the mergeVals argument
        // NOTE: This does not return an Immutable!
        // @param from: The Immutable to copy
        // @param mergeVals: The new values to overwrite as we copy
        */
        function syncMerge (from, mergeVals) {
            var newVals = syncCloneObject(from),
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

        function isRegex (val) {
            return val && val instanceof RegExp;
        }

        setReadOnlyProperty(self, 'setReadOnlyProperty', setReadOnlyProperty);
        setReadOnlyProperty(self, 'copyValue', copyValue);
        setReadOnlyProperty(self, 'cloneObject', cloneObject);
        setReadOnlyProperty(self, 'merge', merge);
        setReadOnlyProperty(self, 'getArgumentNames', getArgumentNames);

        return self;
    }

}());
