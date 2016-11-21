(function () {
    'use strict';

    var objectHelper = ObjectHelper();

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
            } else if (isObject(val)) {
                // TODO: should we enumerate and recurse to ensure type consistency for nested dates?
                // NOTE: we don't need it for the toObject usage, just for init
                return JSON.parse(JSON.stringify(val));
            } else {
                return JSON.parse(JSON.stringify(val));
            }
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
                    newVals[propName] = cloneObject(from[propName]);
                } else {
                    newVals[propName] = copyValue(from[propName]);
                }
            }

            return newVals;
        } // /toObject

        function isDate (val) {
            return typeof val === 'object' &&
                Object.prototype.toString.call(val) === '[object Date]';
        }

        function isObject (val) {
            return typeof val === 'object';
        }

        setReadOnlyProperty(self, 'setReadOnlyProperty', setReadOnlyProperty);
        setReadOnlyProperty(self, 'copyValue', copyValue);
        setReadOnlyProperty(self, 'cloneObject', cloneObject);

        return self;
    }

}());
