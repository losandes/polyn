(function () {
    'use strict';

    var locale = {
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
        module.exports = Factory({
            Blueprint: require('./Blueprint.js'),
            Exception: require('./Exception.js'),
            objectHelper: require('./objectHelper.js'),
            is: require('./is.js'),
            async: require('./async.js')
        });
    } else if (window && window.polyn) {
        window.polyn.addModule('Immutable', ['async', 'Blueprint', 'is', 'Exception', 'objectHelper'], Factory);
    } else {
        console.log(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME or POLYN NOT DEFINED'));
    }

    function Factory(polyn) {
        return new ImmutableFactory(
            polyn.Blueprint,
            polyn.Exception,
            polyn.objectHelper,
            polyn.is,
            polyn.async
        );
    }

    /*
    // Immutable
    */
    function ImmutableFactory(Blueprint, Exception, objectHelper, is, async) {
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
            var schema = {}, blueprint, prop, propCtor;

            if (!originalSchema) {
                return new InvalidArgumentException(new Error('A schema object, and values are required'));
            }

            // Convert any objects that aren't validatable by Blueprint into Immutables
            for (prop in originalSchema) {
                if (!originalSchema.hasOwnProperty(prop)) {
                    continue;
                } else if (prop === '__skipValidation') {
                    continue;
                } else if (prop === '__skipValdation') {
                    schema.__skipValidation = originalSchema.skipValdation;
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

                if (schema[prop].__immutableCtor) {
                    // Add access to the Immutable on the Parent Immutable
                    propCtor = prop.substring(0,1).toUpperCase() + prop.substring(1);
                    Constructor[propCtor] = schema[prop];
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
                    // `schema.__skipValidation: true`
                    originalSchema.__skipValidation !== true &&
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
                        } else if (propName === '__blueprintId') {
                            continue;
                        }

                        if (is.nullOrUndefined(values[propName])) {
                            makeReadOnlyNullProperty(self, propName);
                            continue;
                        }

                        makeImmutableProperty(self, schema, values, propName);
                    }

                    Object.freeze(self);
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
            setReadOnlyProp(Constructor, 'merge', function (from, mergeVals, callback) {
                if (typeof callback === 'function') {
                    async.runAsync(function () {
                        merge(Constructor, from, mergeVals, callback);
                    });
                } else {
                    var output;

                    merge(Constructor, from, mergeVals, function (err, merged) {
                        output = err || merged;
                    });

                    return output;
                }
            });

            /*
            // Copies the values of an Immutable to a plain JS Object
            // @param from: The Immutable to copy
            */
            setReadOnlyProp(Constructor, 'toObject', function (from, callback) {
                return objectHelper.cloneObject(from, true, callback);
            });

            /*
            // Validates an instance of an Immutable against it's schema
            // @param instance: The instance that is being validated
            */
            setReadOnlyProp(Constructor, 'validate', function (instance, callback) {
                return Blueprint.validate(blueprint, instance, callback);
            });

            /*
            // Validates an instance of an Immutable against it's schema
            // @param instance: The instance that is being validated
            */
            setReadOnlyProp(Constructor, 'validateProperty', function (instance, propertyName, callback) {
                if (!instance && is.function(callback)) {
                    callback([locale.errors.validatePropertyInvalidArgs], false);
                } else if (!instance) {
                    return {
                        errors: [locale.errors.validatePropertyInvalidArgs],
                        result: false
                    };
                }

                return Blueprint.validateProperty(blueprint, propertyName, instance[propertyName], callback);
            });

            /*
            // Prints an immutable to the console, in a more readable way
            // @param instance: The Immutable to print
            */
            setReadOnlyProp(Constructor, 'log', function (instance) {
                if (!instance) {
                    console.log(null);
                } else {
                    console.log(Constructor.toObject(instance));
                }
            });

            /*
            // Returns a copy of the original schema
            */
            setReadOnlyProp(Constructor, 'getSchema', function (callback) {
                return objectHelper.cloneObject(originalSchema, true, callback);
            });

            /*
            // Returns a this Immutable's blueprint
            */
            setReadOnlyProp(Constructor, 'blueprint', blueprint);

            setReadOnlyProp(Constructor, '__immutableCtor', true);
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
            var Model, dateCopy;

            if (schema[propName].__immutableCtor && is.function(schema[propName])) {
                // this is a nested immutable
                Model = schema[propName];
                self[propName] = new Model(values[propName]);
            } else if (isDate(values[propName])) {
                dateCopy = new Date(values[propName]);

                Object.defineProperty(self, propName, {
                    get: function () {
                        return new Date(dateCopy);
                    },
                    enumerable: true,
                    configurable: false
                });

                Object.freeze(self[propName]);
            } else {
                objectHelper.setReadOnlyProperty(
                    self,
                    propName,
                    // TODO: is it really necessary to clone the value if it isn't an object?
                    objectHelper.copyValue(values[propName]),
                    // typeof values[propName] === 'object' ? objectHelper.copyValue(values[propName]) : values[propName],
                    makeSetHandler(propName)
                );

                if (Array.isArray(values[propName])) {
                    Object.freeze(self[propName]);
                }
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

        function setReadOnlyProp (obj, name, val) {
            objectHelper.setReadOnlyProperty(obj, name, val, function () {
                var err = new Exception(locale.errorTypes.readOnlyViolation, new Error(name + ' is read-only'));
                config.onError(err);
                return err;
            });
        }

        function merge (Constructor, from, mergeVals, callback) {
            var mergedObj = objectHelper.merge(from, mergeVals),
                merged;

            if (mergedObj.isException) {
                return callback(mergedObj);
            }

            merged = new Constructor(mergedObj);

            if (merged.isException) {
                return callback(merged);
            } else {
                return callback(null, merged);
            }
        }

        function isDate (val) {
            return typeof val === 'object' &&
                Object.prototype.toString.call(val) === '[object Date]';
        }



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
