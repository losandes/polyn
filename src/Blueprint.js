(function () {
    'use strict';

    var bp;

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Ctor(require('./async.js'), require('./id.js'), require('./is.js'), require('./Exception.js'));
    } else if (window) {
        if (
            !window.polyn ||
            !window.polyn.async ||
            !window.polyn.id ||
            !window.polyn.is ||
            !window.polyn.Exception
        ) {
            return console.log('Unable to define module: LOADED OUT OF ORDER');
        }

        bp = Ctor(window.polyn.async, window.polyn.id, window.polyn.is, window.polyn.Exception);

        Object.defineProperty(window.polyn, 'Blueprint', {
            get: function () {
                return bp;
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
    // Blueprint
    */
    function Ctor(async, id, is, Exception) {
        var Blueprint,
            signatureMatches,
            syncSignatureMatches,
            validateSignature,
            syncValidateSignature,
            validateProperty,
            validatePropertyWithDetails,
            validatePropertyType,
            validateFunctionArguments,
            validateDecimalWithPlaces,
            validateBooleanArgument,
            validateNestedBlueprint,
            makeErrorMessage,
            setReadOnlyProp,
            config = {
                rememberValidation: true,
                compatibility: 'v0.3.0'
            },
            locale = {
                errors: {
                    blueprint: {
                        requiresImplementation: 'An implementation is required to create a new instance of an interface',
                        requiresProperty: 'This implementation does not satisfy blueprint, {{blueprint}}. It should have the property, {{property}}, with type, {{type}}.',
                        requiresArguments: 'This implementation does not satisfy blueprint, {{blueprint}}. The function, {{property}}, is missing arguments',
                        missingConstructorArgument: 'An object literal is required when constructing a Blueprint',
                        missingSignaturesMatchBlueprintArgument: 'The `blueprint` argument is required',
                        missingSignaturesMatchImplementationArgument: 'The `implementation` argument is required',
                        missingSignaturesMatchCallbackArgument: 'The `callback` argument is required'
                    }
                }
            };

        /*
        // wraps the callback and validates that the implementation matches the blueprint signature
        */
        signatureMatches = function (implementation, blueprint, callback) {
            var newCallback;

            if (config.rememberValidation) {
                if (config.compatibility === 'v0.3.0') {
                    implementation.__interfaces = implementation.__interfaces || {};
                } else {
                    implementation.__blueprints = implementation.__blueprints || {};
                }
            }

            newCallback = function (err, result) {
                if (config.rememberValidation && !err) {
                    if (config.compatibility === 'v0.3.0') {
                        implementation.__interfaces[blueprint.__blueprintId] = true;
                    } else {
                        implementation.__blueprints[blueprint.__blueprintId] = true;
                    }
                }

                if (typeof callback === 'function') {
                    callback(err, result);
                }
            };

            validateSignature(implementation, blueprint, newCallback);
        };

        /*
        // wraps the callback and validates that the implementation matches the blueprint signature
        */
        syncSignatureMatches = function (implementation, blueprint) {
            var validationResult;

            implementation.__interfaces = implementation.__interfaces || {};
            validationResult = syncValidateSignature(implementation, blueprint);

            if (validationResult.result) {
                implementation.__interfaces[blueprint.__blueprintId] = true;
            }

            return validationResult;
        };

        /*
        // validates that the implementation matches the blueprint signature
        // executes the callback with errors, if any, and a boolean value for the result
        */
        validateSignature = function (implementation, blueprint, callback) {
            async.runAsync(function () {
                var validationResult = syncValidateSignature(implementation, blueprint);

                if (validationResult.result) {
                    callback(null, true);
                } else {
                    callback(validationResult.errors, false);
                }
            });
        };

        /*
        // validates that the implementation matches the blueprint signature
        // executes the callback with errors, if any, and a boolean value for the result
        */
        syncValidateSignature = function (implementation, blueprint) {
            var errors = [],
                prop;

            // if the implementation was already validated previously, skip validation
            if (implementation.__interfaces[blueprint.__blueprintId]) {
                return {
                    errors: null,
                    result: true
                };
            }

            // validate each blueprint property
            for (prop in blueprint.props) {
                if (blueprint.props.hasOwnProperty(prop)) {
                    validateProperty(blueprint.__blueprintId, implementation, prop, blueprint.props[prop], errors);
                }
            }

            if (errors.length > 0) {
                return {
                    errors: errors,
                    result: false
                };
            } else {
                return {
                    errors: null,
                    result: true
                };
            }
        };

        /*
        // validates a single property from the blueprint
        */
        validateProperty = function (blueprintId, implementation, propertyName, propertyValue, errors) {
            if (is.string(propertyValue)) {
                validatePropertyType(blueprintId, implementation, propertyName, propertyValue, errors);
            } else if (is.object(propertyValue)) {
                validatePropertyWithDetails(blueprintId, implementation, propertyName, propertyValue, propertyValue.type, errors);
            }
        };

        /*
        // validates blueprint properties that have additional details set, such as function arguments and decimal places
        */
        validatePropertyWithDetails = function (blueprintId, implementation, propertyName, propertyValue, type, errors) {
            if (propertyValue.required === false && (is.not.defined(implementation[propertyName]) || implementation[propertyName] === null)) {
                // the property isn't required and isn't defined, so there is nothing to validate
                return;
            } else if (is.function(propertyValue.validate)) {
                propertyValue.validate(implementation[propertyName], errors, implementation);
            } else {
                switch(type) {
                    case 'blueprint':
                        validateNestedBlueprint(propertyValue.blueprint, implementation, propertyName, errors);
                        break;
                    case 'function':
                        validatePropertyType(blueprintId, implementation, propertyName, type, errors);
                        if (propertyValue.args) {
                            validateFunctionArguments(blueprintId, implementation, propertyName, propertyValue.args, errors);
                        }
                        break;
                    case 'decimal':
                        validateDecimalWithPlaces(blueprintId, implementation, propertyName, propertyValue.places, errors);
                        break;
                    default:
                        validatePropertyType(blueprintId, implementation, propertyName, type, errors);
                        break;
                }
            }
        };

        makeErrorMessage = function (message, blueprintId, propertyName, propertyType) {
            return message
                .replace(/{{blueprint}}/gi, blueprintId)
                .replace(/{{property}}/gi, propertyName)
                .replace(/{{type}}/gi, propertyType);
        };

        /*
        // validates that the property type matches the expected blueprint property type
        // i.e. that implementation.num is a number, if the blueprint has a property: num: 'number'
        */
        validatePropertyType = function (blueprintId, implementation, propertyName, propertyType, errors) {
            if (is.function(is.not[propertyType]) && is.not[propertyType](implementation[propertyName])) {
                errors.push(makeErrorMessage(locale.errors.blueprint.requiresProperty, blueprintId, propertyName, propertyType));
            }
        };

        /*
        // validates that the implementation has appropriate arguments to satisfy the blueprint
        */
        validateFunctionArguments = function (blueprintId, implementation, propertyName, propertyArguments, errors) {
            // if propertyArguments were defined as an array on the blueprint
            var argumentsAreValid,
                argumentsString;

            argumentsAreValid = is.array(propertyArguments);
            // and the array isn't empty
            argumentsAreValid = argumentsAreValid && propertyArguments.length > 0;
            // and the implementation has the function
            argumentsAreValid = argumentsAreValid && is.function(implementation[propertyName]);
            // and the function has the same number of arguments as the propertyArguments array
            argumentsAreValid = argumentsAreValid && implementation[propertyName].length === propertyArguments.length;

            // then if argumentsAreValid is not true, push errors into the error array
            if (!argumentsAreValid) {
                try { argumentsString = propertyArguments.join(', '); } catch (e) { argumentsString = propertyArguments.toString(); }
                errors.push(makeErrorMessage(locale.errors.blueprint.requiresArguments, blueprintId, propertyName, argumentsString));
            }
        };

        /*
        // validates that a number is a decimal with a given number of decimal places
        */
        validateDecimalWithPlaces = function (blueprintId, implementation, propertyName, places, errors) {
            if (is.not.decimal(implementation[propertyName], places)) {
                errors.push(makeErrorMessage(locale.errors.blueprint.requiresProperty, blueprintId, propertyName, 'decimal with ' + places + ' places'));
            }
        };

        validateBooleanArgument = function (blueprintId, implementation, propertyName, errors) {
            if (is.function(is.not.boolean) && is.not.boolean(implementation[propertyName])) {
                errors.push(makeErrorMessage(locale.errors.blueprint.requiresProperty, blueprintId, propertyName, 'boolean'));
            }
        };

        validateNestedBlueprint = function (blueprint, implementation, propertyName, errors) {
            var validationResult = blueprint.syncSignatureMatches(implementation[propertyName]),
                i;

            if (!validationResult.result) {
                for (i = 0; i < validationResult.errors.length; i += 1) {
                    errors.push(validationResult.errors[i]);
                }
            }
        };

        setReadOnlyProp = function (obj, name, val) {
            Object.defineProperty(obj, name, {
                get: function () {
                    return val;
                },
                set: function () {
                    var err = new Exception('ReadOnlyViolation', new Error(name + ' is read-only'));
                    console.log(err);
                    return err;
                },
                // this property should show up when this object's property names are enumerated
                enumerable: true,
                // this property may not be deleted
                configurable: false
            });
        };

        /*
        // The Blueprint constructor
        */
        Blueprint = function (blueprint) {
            var self = {},
                props = {},
                prop;

            blueprint = blueprint || {};

            for (prop in blueprint) {
                if (blueprint.hasOwnProperty(prop)) {
                    if (prop === '__blueprintId') {
                        setReadOnlyProp(self, '__blueprintId', blueprint.__blueprintId);
                    } else {
                        props[prop] = blueprint[prop];
                    }
                }
            }

            if (is.not.string(self.__blueprintId)) {
                setReadOnlyProp(self, '__blueprintId', id.createUid(8));
            }

            setReadOnlyProp(self, 'props', props);

            setReadOnlyProp(self, 'signatureMatches', function (implementation, callback) {
                return Blueprint.signaturesMatch(self, implementation, callback);
            });

            setReadOnlyProp(self, 'syncSignatureMatches', function (implementation) {
                return Blueprint.syncSignaturesMatch(self, implementation);
            });

            setReadOnlyProp(self, 'inherits', function (otherBlueprint) {
                return Blueprint.syncMerge([self, otherBlueprint]);
            });

            return self;
        };

        Blueprint.signaturesMatch = function (blueprint, implementation, callback) {
            if (is.not.defined(blueprint)) {
                callback([locale.errors.blueprint.missingSignaturesMatchBlueprintArgument]);
                return;
            }

            if (is.not.defined(implementation)) {
                callback([locale.errors.blueprint.missingSignaturesMatchImplementationArgument]);
                return;
            }

            if (is.not.function(callback)) {
                throw new Error(locale.errors.blueprint.missingSignaturesMatchCallbackArgument);
            }

            async.runAsync(function () {
                signatureMatches(implementation, blueprint, callback);
            });
        };

        Blueprint.syncSignaturesMatch = function (blueprint, implementation) {
            if (is.not.defined(blueprint)) {
                return {
                    errors: [locale.errors.blueprint.missingSignaturesMatchBlueprintArgument],
                    result: false
                };
            }

            if (is.not.defined(implementation)) {
                return {
                    errors: [locale.errors.blueprint.missingSignaturesMatchImplementationArgument],
                    result: false
                };
            }

            return syncSignatureMatches(implementation, blueprint);
        };

        Blueprint.merge = function (blueprints, callback) {
            async.runAsync(function () {
                callback(null, Blueprint.syncMerge(blueprints));
            });
        };

        /*
        // Merge the properties of multiple blueprints.
        // Precedence is from left to right, so the existence
        // of a property in a blueprint on the left overrides
        // the existence of a blueprint to it's right
        */
        Blueprint.syncMerge = function (blueprints) {
            var blueprint1, prop, next = true;

            if (!Array.isArray(blueprints)) {
                return null;
            }

            blueprint1 = blueprints.shift();

            while (next) {
                next = blueprints.shift();

                if (!next) {
                    break;
                }

                for (prop in next.props) {
                    if (next.props.hasOwnProperty(prop)) {
                        blueprint1.props[prop] = blueprint1.props[prop] || next.props[prop];
                    }
                }
            }

            return blueprint1;
        };

        Blueprint.configure = function (cfg) {
            cfg = cfg || {};

            if (typeof cfg.rememberValidation !== 'undefined') {
                config.rememberValidation = cfg.rememberValidation;
            }

            if (typeof cfg.compatibility !== 'undefined') {
                config.compatibility = cfg.compatibility;
            }
        };

        return Blueprint;
    } // /Ctor

}());
