(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Factory({
            async: require('./async.js'),
            id: require('./id.js'),
            is: require('./is.js'),
            Exception: require('./Exception.js'),
            objectHelper: require('./objectHelper.js')
        });
    } else if (window && window.polyn) {
        window.polyn.addModule('Blueprint', ['async', 'id', 'is', 'Exception', 'objectHelper'], Factory);
    } else {
        console.log(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME or POLYN NOT DEFINED'));
    }

    function Factory(polyn) {
        return new Blueprint(
            polyn.async,
            polyn.id,
            polyn.is,
            polyn.Exception,
            polyn.objectHelper
        );
    }

    /*
    // Blueprint
    */
    function Blueprint(async, id, is, Exception, objectHelper) {
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
            validateRegExp,
            addValidationMemoryProperty,
            rememberValidation,
            isAlreadyValidated,
            dateIsBefore,
            dateIsAfter,
            makeErrorMessage,
            setReadOnlyProp,
            setDefaultCompatibility,
            setDefaultConfiguration,
            config = {},
            versions = {
                v20161119: new Date('2016-11-19'),
                v20161120: new Date('2016-11-20')
            },
            locale = {
                errorTypes: {
                    invalidArgumentException: 'InvalidArgumentException',
                    readOnlyViolation: 'ReadOnlyViolation'
                },
                errors: {
                    requiresImplementation: 'An implementation is required to create a new instance of an interface',
                    requiresProperty: 'This implementation does not satisfy blueprint, {{blueprint}}. It should have the property, {{property}}, with type, {{type}}.',
                    requiresArguments: 'This implementation does not satisfy blueprint, {{blueprint}}. The function, {{property}}, is missing arguments',
                    missingConstructorArgument: 'An object literal is required when constructing a Blueprint',
                    missingSignaturesMatchBlueprintArgument: 'The `blueprint` argument is required',
                    missingSignaturesMatchImplementationArgument: 'The `implementation` argument is required',
                    missingSignaturesMatchCallbackArgument: 'The `callback` argument is required',
                    configurationCompatibilityIsNotValid: 'The date you tried to set the Blueprint compatibility to is not valid',
                    validatePropertyInvalidArgs: 'To validate a single property, you must provide the blueprint, and the property name',
                    validatePropertyNoBlueprintValue: 'The {{property}} property does not exist on the blueprint',
                    validatePropertyFailed: 'An error occurred while validating the property'
                }
            };

        /*
        // wraps the callback and validates that the implementation matches the blueprint signature
        */
        signatureMatches = function (implementation, blueprint, callback) {
            var newCallback;

            implementation = addValidationMemoryProperty(implementation);

            newCallback = function (err, result) {
                if (!err) {
                    rememberValidation(implementation, blueprint);
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

            implementation = addValidationMemoryProperty(implementation);
            validationResult = syncValidateSignature(implementation, blueprint);

            if (validationResult.result) {
                rememberValidation(implementation, blueprint);
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
            if (isAlreadyValidated(implementation, blueprint)) {
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
            } else if (is.regexp(propertyValue)) {
                validateRegExp(blueprintId, implementation, propertyName, propertyValue, errors);
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
                    case 'expression':
                        validateRegExp(blueprintId, implementation, propertyName, propertyValue.expression, errors);
                        break;
                    default:
                        validatePropertyType(blueprintId, implementation, propertyName, type, errors);
                        break;
                }
            }
        };

        /*
        // validates that the property type matches the expected blueprint property type
        // i.e. that implementation.num is a number, if the blueprint has a property: num: 'number'
        */
        validatePropertyType = function (blueprintId, implementation, propertyName, propertyType, errors) {
            if (is.function(is.not[propertyType]) && is.not[propertyType](implementation[propertyName])) {
                errors.push(makeErrorMessage(locale.errors.requiresProperty, blueprintId, propertyName, propertyType));
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
                errors.push(makeErrorMessage(locale.errors.requiresArguments, blueprintId, propertyName, argumentsString));
            }
        };

        /*
        // validates that a number is a decimal with a given number of decimal places
        */
        validateDecimalWithPlaces = function (blueprintId, implementation, propertyName, places, errors) {
            if (is.not.decimal(implementation[propertyName], places)) {
                errors.push(makeErrorMessage(locale.errors.requiresProperty, blueprintId, propertyName, 'decimal with ' + places + ' places'));
            }
        };

        validateBooleanArgument = function (blueprintId, implementation, propertyName, errors) {
            if (is.function(is.not.boolean) && is.not.boolean(implementation[propertyName])) {
                errors.push(makeErrorMessage(locale.errors.requiresProperty, blueprintId, propertyName, 'boolean'));
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

        validateRegExp = function (blueprintId, implementation, propertyName, regex, errors) {
            if (regex.test(implementation[propertyName]) === false) {
                errors.push(makeErrorMessage(locale.errors.requiresProperty, blueprintId, propertyName, regex.toString()));
            }
        };

        /*
        // Ensures that a __blueprints object exists, if appropriate
        */
        addValidationMemoryProperty = function (implementation) {
            if (config.rememberValidation) {
                try {
                    implementation[config.memoryPropertName] = implementation[config.memoryPropertName] || {};
                } catch (e) {
                    // swallow
                }
            }

            return implementation;
        };

        /*
        // Adds the given blueprint to the validation memory
        */
        rememberValidation = function (implementation, blueprint) {
            if (config.rememberValidation) {
                try {
                    implementation[config.memoryPropertName][blueprint.__blueprintId] = true;
                } catch (e) {
                    // swallow
                }
            }

            return implementation;
        };

        /*
        // Checks to see if this blueprint was already processed
        */
        isAlreadyValidated = function (implementation, blueprint) {
            return implementation[config.memoryPropertName] &&
                implementation[config.memoryPropertName][blueprint.__blueprintId];
        };

        dateIsBefore = function (baselineDate, comparisonDate) {
            return comparisonDate < baselineDate;
        };

        dateIsAfter = function (baselineDate, comparisonDate) {
            return comparisonDate > baselineDate;
        };

        makeErrorMessage = function (message, blueprintId, propertyName, propertyType) {
            return message
                .replace(/{{blueprint}}/gi, blueprintId)
                .replace(/{{property}}/gi, propertyName)
                .replace(/{{type}}/gi, propertyType);
        };

        setReadOnlyProp = function (obj, name, val) {
            objectHelper.setReadOnlyProperty(obj, name, val, function () {
                var err = new Exception(locale.errorTypes.readOnlyViolation, new Error(name + ' is read-only'));
                config.onError(err);
                return err;
            });
        };

        /*
        // The Blueprint constructor
        */
        Blueprint = function (blueprint) {
            var self = {},
                props = {},
                hasInvalidProperties = false,
                prop;

            blueprint = blueprint || {};

            for (prop in blueprint) {
                if (!blueprint.hasOwnProperty(prop)) {
                    continue;
                }

                if (prop === '__blueprintId') {
                    setReadOnlyProp(self, '__blueprintId', blueprint.__blueprintId);
                } else if (Blueprint.isValidatableProperty(blueprint[prop])) {
                    setReadOnlyProp(props, prop, blueprint[prop]);
                } else {
                    hasInvalidProperties = true;
                    var err = new Exception(locale.errorTypes.invalidArgumentException, new Error(prop + ' is not validatable by Blueprint'));
                    config.onError(err);
                }
            }

            if (is.not.string(self.__blueprintId)) {
                setReadOnlyProp(self, '__blueprintId', id.createUid(8));
            }

            setReadOnlyProp(self, 'props', props);

            setReadOnlyProp(self, 'validate', function (implementation, callback) {
                return Blueprint.validate(self, implementation, callback);
            });

            setReadOnlyProp(self, 'validateProperty', function (propertyName, propertyValue, callback) {
                return Blueprint.validateProperty(self, propertyName, propertyValue, callback);
            });

            setReadOnlyProp(self, 'signatureMatches', function (implementation, callback) {
                return Blueprint.validate(self, implementation, callback);
            });

            setReadOnlyProp(self, 'syncSignatureMatches', function (implementation) {
                return Blueprint.syncValidate(self, implementation);
            });

            setReadOnlyProp(self, 'inherits', function (otherBlueprint) {
                return Blueprint.syncMerge([self, otherBlueprint]);
            });

            setReadOnlyProp(self, 'hasInvalidProperties', hasInvalidProperties);

            /*
            // Returns a copy of the original blueprint/schema
            */
            setReadOnlyProp(self, 'getSchema', function () {
                return objectHelper.cloneObject(blueprint);
            });

            return self;
        };

        Blueprint.validate = function (blueprint, implementation, callback) {
            if (is.not.function(callback)) {
                // process this synchronously
                return Blueprint.syncValidate(blueprint, implementation);
            }

            async.runAsync(function () {
                signatureMatches(implementation, blueprint, callback);
            });
        };

        Blueprint.syncValidate = function (blueprint, implementation) {
            if (is.not.defined(blueprint)) {
                return {
                    errors: [locale.errors.missingSignaturesMatchBlueprintArgument],
                    result: false
                };
            }

            if (is.not.defined(implementation)) {
                return {
                    errors: [locale.errors.missingSignaturesMatchImplementationArgument],
                    result: false
                };
            }

            return syncSignatureMatches(implementation, blueprint);
        };

        Blueprint.validateProperty = function (blueprint, propertyName, propertyValue, callback) {
            if (is.not.function(callback)) {
                // process this synchronously
                return Blueprint.syncValidateProperty(blueprint, propertyName, propertyValue);
            }

            async.runAsync(function () {
                var outcome = Blueprint.syncValidateProperty(blueprint, propertyName, propertyValue);

                if (!outcome) {
                    return callback([locale.errors.validatePropertyFailed], false);
                }

                callback(outcome.errors, outcome.result);
            });
        };

        Blueprint.syncValidateProperty = function (blueprint, propertyName, propertyValue) {
            var implementation = {}, errors = [], blueprintProp;

            if (is.not.defined(blueprint) || is.not.string(propertyName)) {
                return {
                    errors: [locale.errors.validatePropertyInvalidArgs],
                    result: false
                };
            }

            blueprintProp = (blueprint.props && blueprint.props[propertyName]) || blueprint[propertyName];

            if (is.not.defined(blueprintProp)) {
                return {
                    errors: [locale.errors.validatePropertyNoBlueprintValue.replace(/{{property}}/, propertyName)],
                    result: false
                };
            }

            implementation[propertyName] = propertyValue;
            validateProperty(blueprint.__blueprintId, implementation, propertyName, blueprintProp, errors);

            return {
                errors: errors.length === 0 ? null : errors,
                result: errors.length === 0 ? true : false
            };
        };

        Blueprint.merge = function (blueprints, callback) {
            if (typeof callback !== 'function') {
                return Blueprint.syncMerge(blueprints);
            }

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

        setDefaultCompatibility = function (cfg) {
            if (is.string(cfg.compatibility)) {
                try {
                    config.compatibility = new Date(cfg.compatibility);
                } catch (e) {
                    config.compatibility =  new Date('2016-11-19');
                    console.log(locale.errors.configurationCompatibilityIsNotValid);
                }
            } else if (is.date(cfg.compatibility)) {
                config.compatibility = cfg.compatibility;
            } else { // default
                config.compatibility =  new Date('2016-11-19');
            }
        };

        setDefaultConfiguration = function () {
            if (dateIsAfter(versions.v20161119, config.compatibility)) {
                config.rememberValidation =  false;
                config.memoryPropertName = '__blueprints';
            } else {
                config.rememberValidation =  true;
                config.memoryPropertName = '__interfaces';
            }

            config.onError = function (message) {
                console.log(message);
            };
        };

        Blueprint.types = [
            'array',
            'blueprint',
            'bool',
            'boolean',
            'date',
            'datetime',
            'decimal',
            'expression',
            'function',
            'money',
            'nullOrWhitespace',
            'number',
            'object',
            'regexp',
            'string',
            'ObjectID'
        ];

        Blueprint.isValidatableProperty = function (obj) {
            if (!obj) {
                return false;
            } if (
                // nested blueprint
                obj.__blueprintId ||
                // known type by string arg
                (is.string(obj) && Blueprint.types.indexOf(obj) > -1) ||
                // known type by obj.type arg
                (is.string(obj.type) && Blueprint.types.indexOf(obj.type) > -1) ||
                // regular expression
                is.regexp(obj) ||
                // validate function exists
                is.function(obj.validate)
            ) {
                return true;
            }

            return false;
        };

        Blueprint.configure = function (cfg) {
            cfg = cfg || {};

            setDefaultCompatibility(cfg);
            setDefaultConfiguration();

            if (is.defined(cfg.rememberValidation)) {
                config.rememberValidation = cfg.rememberValidation;
            }

            if (is.function(cfg.onError)) {
                config.onError = cfg.onError;
            }

            // return a copy of the config
            return objectHelper.copyValue(config);
        };

        // SET CONFIGURATION DEFAULTS
        Blueprint.configure();

        return Blueprint;
    } // /Ctor

}());
