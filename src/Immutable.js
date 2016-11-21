(function () {
    'use strict';

    var Immutable;

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Ctor(
            require('./Blueprint.js'),
            require('./Exception.js')
        );
    } else if (window) {
        if (
            !window.polyn ||
            !window.polyn.Blueprint ||
            !window.polyn.Exception
        ) {
            return console.log('Unable to define module: LOADED OUT OF ORDER');
        }

        Immutable = Ctor(
            window.polyn.Blueprint,
            window.polyn.Exception
        );

        Object.defineProperty(window.polyn, 'Immutable', {
            get: function () {
                return Immutable;
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
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    /*
    // Immutable
    */
    function Ctor(Blueprint, Exception) {
        var config = {
            onError: function (exception) {
                console.log(exception);
            }
        };

        /*
        // Creates a Constructor for an Immutable object from a schema.
        // @param schema (Object): the Blueprint schema (JavaScript Object)
        */
        function Immutable (schema) {
            var blueprint;

            if (!schema) {
                return new InvalidArgumentException(new Error('A schema object, and values are required'));
            }

            // TODO: It doesn't really make sense to support the type, 'object'
            // for an immutable blueprint - should we inspect that here?
            blueprint = new Blueprint(schema);

            /*
            // The Constructor is returned by this Immutable function. Callers can
            // then use it to create new instances of objects that they expect to
            // meet the schema, set forth by this Immutable.
            */
            function Constructor (values) {
                var propName,
                    // the private properties are set on this
                    internal = {},
                    // we return self - it will provide access to the getters and setters
                    self = {};

                values = values || {};

                if (
                    // you can override initial validation by setting
                    // `schema.__skipValdation: true`
                    schema.__skipValdation !== true &&
                    !Blueprint.validate(blueprint, values).result
                ) {
                    var err = new InvalidArgumentException(
                        new Error('The argument passed to the constructor is not valid'),
                        Blueprint.validate(blueprint, values).errors
                    );

                    config.onError(err);

                    return err;
                }

                try {
                    // Enumerate the schema, and create immutable properties
                    for (propName in schema) {
                        if (schema.hasOwnProperty(propName) && typeof values[propName] !== 'undefined') {
                            makeImmutableProperty(self, internal, schema, values, propName);
                        } else if (schema.hasOwnProperty(propName)) {
                            makeReadOnlyNullProperty(self, propName);
                        }
                    }
                } catch (e) {
                    return new InvalidArgumentException(e);
                }

                return self;
            } // /Constructor

            /*
            // Makes a new Immutable from an existing Immutable, replacing
            // values with the properties in the mergeVals argument
            // @param from: The Immutable to copy
            // @param mergeVals: The new values to overwrite as we copy
            */
            Constructor.merge = function (from, mergeVals) {
                return new Constructor(merge(from, mergeVals));
            };

            /*
            // Copies the values of an Immutable to a plain JS Object
            // @param from: The Immutable to copy
            */
            Constructor.toObject = function (from) {
                return toObject(from, {});
            };

            /*
            // Validates an instance of an Immutable against it's schema
            // @param instance: The instance that is being validated
            */
            Constructor.validate = function (instance, callback) {
                return Blueprint.validate(blueprint, instance, callback);
            };

            /*
            // Prints an immutable to the console, in a more readable way
            // @param instance: The Immutable to print
            */
            Constructor.log = function (instance) {
                if (!instance) {
                    console.log(null);
                } else {
                    console.log(Constructor.toObject(instance));
                }
            };

            Constructor.__immutableCtor = true;
            return Constructor;
        } // /Immutable

        /*
        // Creates a copy of the value on `internal`, and creates a
        // read-only property on `self`
        // @param self: The object that will be returned by the Constructor
        // @param internal: The private object that contains all of the values
        // @param schema: The schema for this object
        // @param values: The values that are being written to this object
        // @param propName: The name of the property that is being written to this object
        */
        function makeImmutableProperty (self, internal, schema, values, propName) {
            // In order to guarantee that the values we return cannot be
            // modified, we need to make a copy of their values.
            if (typeof schema[propName] && schema[propName].__immutableCtor) {
                // this is a nested immutable
                internal[propName] = new schema[propName](values[propName]);
            } else {
                internal[propName] = copyValue(values[propName]);
            }

            // Add a property with a getter, and a setter that throws.
            Object.defineProperty(self, propName, {
                get: function () {
                    return internal[propName];
                },
                set: function () {
                    var err = new Exception('ReadOnlyViolation', new Error('Cannot set `' + propName + '`. This object is immutable'));
                    config.onError(err);
                    return err;
                },
                // this property should show up when this object's propNameerties are enumerated
                enumerable: true,
                // this property may not be deleted
                configurable: false
            });
        } // /makeImmutableProperty

        function makeReadOnlyNullProperty (self, propName) {
            // Add a property with a getter, and a setter that throws.
            Object.defineProperty(self, propName, {
                get: function () {
                    return null;
                },
                set: function () {
                    var err = new Exception('ReadOnlyViolation', new Error('Cannot set `' + propName + '`. This object is immutable'));
                    config.onError(err);
                    return err;
                },
                // this property should show up when this object's propNameerties are enumerated
                enumerable: true,
                // this property may not be deleted
                configurable: false
            });
        } // /makeReadOnlyNullProperty

        /*
        // Make a copy of a value, ensuring it's not a reference
        // @param val: The value to get a copy of
        */
        function copyValue (val) {
            if (!val) {
                return val;
            }

            if (typeof val === 'object' && Object.prototype.toString.call(val) === '[object Date]') {
                // the best way to clone a date, is to create a new Date from it
                return new Date(val);
            } else if (typeof val === 'object') {
                // TODO: should we enumerate and recurse to ensure type consistency for nested dates?
                // NOTE: we don't need it for the toObject usage, just for init
                return JSON.parse(JSON.stringify(val));
            } else {
                return JSON.parse(JSON.stringify(val));
            }
        }

        /*
        // Make an exception argument of type InvalidArgumentException
        // @param error: An instance of a JS Error
        // @param messages: An array of messages
        */
        function InvalidArgumentException (error, messages) {
            return new Exception('InvalidArgumentException', error, messages);
        } // /InvalidArgumentException

        /*
        // Makes a new Object from an existing Immutable, replacing
        // values with the properties in the mergeVals argument
        // NOTE: This does not return an Immutable!
        // @param from: The Immutable to copy
        // @param mergeVals: The new values to overwrite as we copy
        */
        function merge (from, mergeVals) {
            var newVals = toObject(from, false),
                propName;

            for (propName in mergeVals) {
                if (mergeVals.hasOwnProperty(propName) && typeof mergeVals[propName] === 'object') {
                    newVals[propName] = merge(newVals[propName], mergeVals[propName]);
                } else if (mergeVals.hasOwnProperty(propName)) {
                    newVals[propName] = mergeVals[propName];
                }
            }

            return newVals;
        } // /merge

        /*
        // Copies the values of an Immutable to a plain JS Object
        // @param from: The Immutable to copy
        // @param deep (default: true): Whether or not to recurse when objects are found
        */
        function toObject (from, deep) {
            var newVals = {},
                propName;

            if (typeof deep === 'undefined') {
                deep = true;
            }

            for (propName in from) {
                if (from.hasOwnProperty(propName) && typeof from[propName] === 'object' && deep) {
                    newVals[propName] = toObject(from[propName]);
                } else if (from.hasOwnProperty(propName)) {
                    newVals[propName] = copyValue(from[propName]);
                }
            }

            return newVals;
        } // /toObject

        /*
        // Confgure Immutable
        */
        Immutable.configure = function (cfg) {
            cfg = cfg || {};

            if (typeof cfg.onError === 'function') {
                config.onError = cfg.onError;
            }
        };

        return Immutable;
    }

}());
