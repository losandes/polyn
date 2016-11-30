(function () {
    'use strict';

    var Immutable,
        locale = {
            errorTypes: {
                invalidArgumentException: 'InvalidArgumentException',
                readOnlyViolation: 'ReadOnlyViolation'
            },
            errors: {
                initialValidationFailed: 'The argument passed to the constructor is not valid',
                validatePropertyInvalidArgs: 'To validate a property, you must provide the instance, and property name'
            }
        };

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Ctor(
            require('./Blueprint.js'),
            require('./Exception.js'),
            require('./objectHelper.js'),
            require('./is.js')
        );
    } else if (window) {
        if (
            !window.polyn ||
            !window.polyn.Blueprint ||
            !window.polyn.Exception ||
            !window.polyn.objectHelper ||
            !window.polyn.is
        ) {
            return console.log('Unable to define module: LOADED OUT OF ORDER');
        }

        Immutable = Ctor(
            window.polyn.Blueprint,
            window.polyn.Exception,
            window.polyn.objectHelper,
            window.polyn.is
        );

        window.polyn.objectHelper.setReadOnlyProperty(window.polyn, 'Immutable', Immutable,
            function () {
                var err = new Error('[POLYN] polyn modules are read-only');
                console.log(err);
                return err;
            }
        );
    } else {
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    /*
    // Immutable
    */
    function Ctor(Blueprint, Exception, objectHelper, is) {
        var config = {
            onError: function (exception) {
                console.log(exception);
            }
        };

        /*
        // Creates a Constructor for an Immutable object from a schema.
        // @param schema (Object): the Blueprint schema (JavaScript Object)
        */
        function Immutable (originalSchema) {
            var schema = {}, blueprint, prop;

            if (!originalSchema) {
                return new InvalidArgumentException(new Error('A schema object, and values are required'));
            }

            // Convert any objects that aren't validatable by Blueprint into Immutables
            for (prop in originalSchema) {
                if (!originalSchema.hasOwnProperty(prop)) {
                    continue;
                }

                if (
                    is.object(originalSchema[prop]) &&
                    !Blueprint.isValidatableProperty(originalSchema[prop]) &&
                    !originalSchema[prop].__immutableCtor
                ) {
                    schema[prop] = new Immutable(originalSchema[prop]);
                } else {
                    schema[prop] = originalSchema[prop];
                }
            }

            // This is the blueprint that the Immutable will be validated against
            blueprint = new Blueprint(schema);

            /*
            // The Constructor is returned by this Immutable function. Callers can
            // then use it to create new instances of objects that they expect to
            // meet the schema, set forth by this Immutable.
            */
            function Constructor (values) {
                var propName,
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
                        new Error(locale.errors.initialValidationFailed),
                        Blueprint.validate(blueprint, values).errors
                    );

                    config.onError(err);

                    return err;
                }

                try {
                    // Enumerate the schema, and create immutable properties
                    for (propName in schema) {
                        if (!schema.hasOwnProperty(propName)) {
                            continue;
                        }

                        if (!values[propName]) {
                            makeReadOnlyNullProperty(self, propName);
                            continue;
                        }

                        makeImmutableProperty(self, schema, values, propName);
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
                return new Constructor(objectHelper.merge(from, mergeVals));
            };

            /*
            // Copies the values of an Immutable to a plain JS Object
            // @param from: The Immutable to copy
            */
            Constructor.toObject = function (from) {
                return objectHelper.cloneObject(from, {});
            };

            /*
            // Validates an instance of an Immutable against it's schema
            // @param instance: The instance that is being validated
            */
            Constructor.validate = function (instance, callback) {
                return Blueprint.validate(blueprint, instance, callback);
            };

            /*
            // Validates an instance of an Immutable against it's schema
            // @param instance: The instance that is being validated
            */
            Constructor.validateProperty = function (instance, propertyName, callback) {
                if (!instance && is.function(callback)) {
                    callback([locale.errors.validatePropertyInvalidArgs], false);
                } else if (!instance) {
                    return {
                        errors: [locale.errors.validatePropertyInvalidArgs],
                        result: false
                    };
                }

                return Blueprint.validateProperty(blueprint, propertyName, instance[propertyName], callback);
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
        // Creates a copy of the value, and creates a read-only property on `self`
        // @param self: The object that will be returned by the Constructor
        // @param schema: The schema for this object
        // @param values: The values that are being written to this object
        // @param propName: The name of the property that is being written to this object
        */
        function makeImmutableProperty (self, schema, values, propName) {
            if (schema[propName].__immutableCtor && is.function(schema[propName])) {
                // this is a nested immutable
                var Model = schema[propName];

                objectHelper.setReadOnlyProperty(
                    self,
                    propName,
                    new Model(values[propName]),
                    makeSetHandler(propName)
                );
            } else {
                objectHelper.setReadOnlyProperty(
                    self,
                    propName,
                    objectHelper.copyValue(values[propName]),
                    makeSetHandler(propName)
                );
            }
        } // /makeImmutableProperty

        /*
        // make a read-only property that returns null
        */
        function makeReadOnlyNullProperty (self, propName) {
            objectHelper.setReadOnlyProperty(self, propName, null, makeSetHandler(propName));
        } // /makeReadOnlyNullProperty

        /*
        // make a set handler that returns an exception
        */
        function makeSetHandler (propName) {
            return function () {
                var err = new Exception(locale.errorTypes.readOnlyViolation, new Error('Cannot set `' + propName + '`. This object is immutable'));
                config.onError(err);
                return err;
            };
        }

        /*
        // Make an exception argument of type InvalidArgumentException
        // @param error: An instance of a JS Error
        // @param messages: An array of messages
        */
        function InvalidArgumentException (error, messages) {
            return new Exception(locale.errorTypes.invalidArgumentException, error, messages);
        } // /InvalidArgumentException

        /*
        // Confgure Immutable
        */
        Immutable.configure = function (cfg) {
            cfg = cfg || {};

            if (is.function(cfg.onError)) {
                config.onError = cfg.onError;
            }
        };

        return Immutable;
    }

}());
