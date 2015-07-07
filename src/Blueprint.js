/*jshint camelcase: false*/
/*globals Hilary, Window*/
(function (scope) {
    'use strict';

    var definition = {
        name: 'polyn.Blueprint',
        dependencies: ['polyn.utils', 'polyn.is', 'polyn.id'],
        factory: undefined
    };
    
    definition.factory = function (utils, is, id) {
        var Blueprint,
            signatureMatches,
            validateSignature,
            validateProperty,
            validatePropertyWithDetails,
            validatePropertyType,
            validateFunctionArguments,
            validateDecimalWithPlaces,
            locale = {
                errors: {
                    blueprint: {
                        requiresImplementation: 'An implementation is required to create a new instance of an interface',
                        requiresProperty: 'The implementation is missing a required property ',
                        requiresArguments: 'The implementation of this function requires arguments ',
                        missingConstructorArgument: 'An object literal is required when constructing a Blueprint',
                        reservedPropertyName_singatureMatches: 'signatureMatches is a reserved property name for Blueprints',
                        missingSignatureMatchesImplementationArgument:'A first argument of an object that should implement an interface is required',
                        missingSignatureMatchesCallbackArgument: 'A callback function is required as the second argument to signatureMatches'
                    }
                }
            };
        
        /*
        // wraps the callback and validates that the implementation matches the blueprint signature
        */
        signatureMatches = function (implementation, blueprint, callback) {
            var newCallback;
            
            implementation.__interfaces = implementation.__interfaces || {};
            
            newCallback = function (err, result) {
                if (!err) {
                    implementation.__interfaces[blueprint.__blueprintId] = true;
                }
                
                if (typeof callback === 'function') {
                    callback(err, result);
                }
            };
            
            validateSignature(implementation, blueprint, newCallback);
        };
        
        /*
        // validates that the implementation matches the blueprint signature
        // executes the callback with errors, if any, and a boolean value for the result
        */
        validateSignature = function (implementation, blueprint, callback) {
            var errors = [],
                prop;
            
            // if the implementation was already validated previously, skip validation
            if (implementation.__interfaces[blueprint.__blueprintId]) {
                callback(null, true);
                return;
            }
            
            // validate each blueprint property
            for (prop in blueprint) {
                if (blueprint.hasOwnProperty(prop) && prop !== '__blueprintId'  && prop !== 'signatureMatches') {
                    validateProperty(implementation, prop, blueprint[prop], errors);
                }
            }

            if (errors.length > 0) {
                callback(errors, false);
            } else {
                callback(null, true);
            }
        };
        
        /*
        // validates a single property from the blueprint
        */
        validateProperty = function (implementation, propertyName, propertyValue, errors) {
            if (is.string(propertyValue)) {
                validatePropertyType(implementation, propertyName, propertyValue, errors);
            } else if (is.object(propertyValue)) {
                validatePropertyWithDetails(implementation, propertyName, propertyValue, propertyValue.type, errors);
            }
        };
        
        /*
        // validates blueprint properties that have additional details set, such as function arguments and decimal places
        */
        validatePropertyWithDetails = function (implementation, propertyName, propertyValue, type, errors) {
            switch(type) {
                case 'function':
                    validatePropertyType(implementation, propertyName, type, errors);
                    validateFunctionArguments(implementation, propertyName, propertyValue.args, errors);
                    break;
                case 'decimal':
                    validateDecimalWithPlaces(implementation, propertyName, propertyValue.places, errors);
                    break;
                default:
                    validatePropertyType(implementation, propertyName, type, errors);
                    break;
            }
        };
        
        /*
        // validates that the property type matches the expected blueprint property type
        // i.e. that implementation.num is a number, if the blueprint has a property: num: 'number'
        */
        validatePropertyType = function (implementation, propertyName, propertyType, errors) {
            if (is.function(is.not[propertyType]) && is.not[propertyType](implementation[propertyName])) {
                var message = locale.errors.blueprint.requiresProperty;
                    message += '@property: ' + propertyName;
                    message += ' (' + propertyType + ')';
                
                errors.push(message);
            }
        };
        
        /*
        // validates that the implementation has appropriate arguments to satisfy the blueprint
        */
        validateFunctionArguments = function (implementation, propertyName, propertyArguments, errors) {
            // if propertyArguments were defined as an array on the blueprint
            var argumentsAreValid = is.array(propertyArguments);
            // and the array isn't empty
            argumentsAreValid = argumentsAreValid && propertyArguments.length > 0;
            // and the implementation has the function
            argumentsAreValid = argumentsAreValid && is.function(implementation[propertyName]);
            // and the function has the same number of arguments as the propertyArguments array
            argumentsAreValid = argumentsAreValid && implementation[propertyName].length === propertyArguments.length;
            
            // then if argumentsAreValid is not true, push errors into the error array
            if (!argumentsAreValid) {
                errors.push(locale.errors.blueprint.requiresArguments + '(' + propertyArguments.join(', ') + ')');
            }
        };
        
        /*
        // validates that a number is a decimal with a given number of decimal places
        */
        validateDecimalWithPlaces = function (implementation, propertyName, places, errors) {
            if (is.not.decimal(implementation[propertyName], places)) {
                var message = locale.errors.blueprint.requiresProperty;
                    message += '@property: ' + propertyName;
                    message += ' (decimal with ' + places + ' places)';
                
                errors.push(message);
            }
        };
        
        /*
        // The Blueprint constructor
        */
        Blueprint = function (blueprint) {
            var self = this,
                prop;
            
            if (is.not.defined(blueprint) || is.not.object(blueprint)) {
                throw new Error(locale.errors.blueprint.missingConstructorArgument);
            }
            
            for (prop in blueprint) {
                if (blueprint.hasOwnProperty(prop)) {
                    if (prop === 'signatureMatches') {
                        throw new Error(locale.errors.blueprint.reservedPropertyName_singatureMatches);
                    }
                    
                    self[prop] = blueprint[prop];
                }
            }
            
            if (is.not.string(self.__blueprintId)) {
                self.__blueprintId = id.createUid(8);
            }
            
            self.signatureMatches = function (implementation, callback) {
                if (is.not.defined(implementation)) {
                    callback([locale.errors.blueprint.missingSignatureMatchesImplementationArgument]);
                    return;
                }
                
                if (is.not.function(callback)) {
                    throw new Error(locale.errors.blueprint.missingSignatureMatchesCallbackArgument);
                }

                utils.runAsync(function () {
                    signatureMatches(implementation, self, callback);
                });
            };
        };
        
        return Blueprint;
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
