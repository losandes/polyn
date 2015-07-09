/*! polyn-build 2015-07-08 */
(function(scope) {
    "use strict";
    var definition = {
        name: "polyn.Blueprint",
        dependencies: [ "polyn.utils", "polyn.is", "polyn.id" ],
        factory: undefined
    };
    definition.factory = function(utils, is, id) {
        var Blueprint, signatureMatches, syncSignatureMatches, validateSignature, syncValidateSignature, validateProperty, validatePropertyWithDetails, validatePropertyType, validateFunctionArguments, validateDecimalWithPlaces, locale = {
            errors: {
                blueprint: {
                    requiresImplementation: "An implementation is required to create a new instance of an interface",
                    requiresProperty: "The implementation is missing a required property ",
                    requiresArguments: "The implementation of this function requires arguments ",
                    missingConstructorArgument: "An object literal is required when constructing a Blueprint",
                    reservedPropertyName_singatureMatches: "signatureMatches is a reserved property name for Blueprints",
                    missingSignatureMatchesImplementationArgument: "A first argument of an object that should implement an interface is required",
                    missingSignatureMatchesCallbackArgument: "A callback function is required as the second argument to signatureMatches"
                }
            }
        };
        signatureMatches = function(implementation, blueprint, callback) {
            var newCallback;
            implementation.__interfaces = implementation.__interfaces || {};
            newCallback = function(err, result) {
                if (!err) {
                    implementation.__interfaces[blueprint.__blueprintId] = true;
                }
                if (typeof callback === "function") {
                    callback(err, result);
                }
            };
            validateSignature(implementation, blueprint, newCallback);
        };
        syncSignatureMatches = function(implementation, blueprint) {
            var validationResult;
            implementation.__interfaces = implementation.__interfaces || {};
            validationResult = syncValidateSignature(implementation, blueprint);
            if (validationResult.result) {
                implementation.__interfaces[blueprint.__blueprintId] = true;
            }
            return validationResult;
        };
        validateSignature = function(implementation, blueprint, callback) {
            var validationResult = syncValidateSignature(implementation, blueprint);
            if (validationResult.result) {
                callback(null, true);
            } else {
                callback(validationResult.errors, false);
            }
        };
        syncValidateSignature = function(implementation, blueprint) {
            var errors = [], prop;
            if (implementation.__interfaces[blueprint.__blueprintId]) {
                return {
                    errors: null,
                    result: true
                };
            }
            for (prop in blueprint) {
                if (blueprint.hasOwnProperty(prop) && prop !== "__blueprintId" && prop !== "signatureMatches") {
                    validateProperty(implementation, prop, blueprint[prop], errors);
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
        validateProperty = function(implementation, propertyName, propertyValue, errors) {
            if (is.string(propertyValue)) {
                validatePropertyType(implementation, propertyName, propertyValue, errors);
            } else if (is.object(propertyValue)) {
                validatePropertyWithDetails(implementation, propertyName, propertyValue, propertyValue.type, errors);
            }
        };
        validatePropertyWithDetails = function(implementation, propertyName, propertyValue, type, errors) {
            if (is.function(propertyValue.validate)) {
                propertyValue.validate(implementation[propertyName], errors);
            } else {
                switch (type) {
                  case "function":
                    validatePropertyType(implementation, propertyName, type, errors);
                    validateFunctionArguments(implementation, propertyName, propertyValue.args, errors);
                    break;

                  case "decimal":
                    validateDecimalWithPlaces(implementation, propertyName, propertyValue.places, errors);
                    break;

                  default:
                    validatePropertyType(implementation, propertyName, type, errors);
                    break;
                }
            }
        };
        validatePropertyType = function(implementation, propertyName, propertyType, errors) {
            if (is.function(is.not[propertyType]) && is.not[propertyType](implementation[propertyName])) {
                var message = locale.errors.blueprint.requiresProperty;
                message += "@property: " + propertyName;
                message += " (" + propertyType + ")";
                errors.push(message);
            }
        };
        validateFunctionArguments = function(implementation, propertyName, propertyArguments, errors) {
            var argumentsAreValid = is.array(propertyArguments);
            argumentsAreValid = argumentsAreValid && propertyArguments.length > 0;
            argumentsAreValid = argumentsAreValid && is.function(implementation[propertyName]);
            argumentsAreValid = argumentsAreValid && implementation[propertyName].length === propertyArguments.length;
            if (!argumentsAreValid) {
                errors.push(locale.errors.blueprint.requiresArguments + "(" + propertyArguments.join(", ") + ")");
            }
        };
        validateDecimalWithPlaces = function(implementation, propertyName, places, errors) {
            if (is.not.decimal(implementation[propertyName], places)) {
                var message = locale.errors.blueprint.requiresProperty;
                message += "@property: " + propertyName;
                message += " (decimal with " + places + " places)";
                errors.push(message);
            }
        };
        Blueprint = function(blueprint) {
            var self = this, prop;
            if (is.not.defined(blueprint) || is.not.object(blueprint)) {
                throw new Error(locale.errors.blueprint.missingConstructorArgument);
            }
            for (prop in blueprint) {
                if (blueprint.hasOwnProperty(prop)) {
                    if (prop === "signatureMatches") {
                        throw new Error(locale.errors.blueprint.reservedPropertyName_singatureMatches);
                    }
                    self[prop] = blueprint[prop];
                }
            }
            if (is.not.string(self.__blueprintId)) {
                self.__blueprintId = id.createUid(8);
            }
            self.signatureMatches = function(implementation, callback) {
                if (is.not.defined(implementation)) {
                    callback([ locale.errors.blueprint.missingSignatureMatchesImplementationArgument ]);
                    return;
                }
                if (is.not.function(callback)) {
                    throw new Error(locale.errors.blueprint.missingSignatureMatchesCallbackArgument);
                }
                utils.runAsync(function() {
                    signatureMatches(implementation, self, callback);
                });
            };
            self.syncSignatureMatches = function(implementation) {
                if (is.not.defined(implementation)) {
                    return {
                        errors: [ locale.errors.blueprint.missingSignatureMatchesImplementationArgument ],
                        result: false
                    };
                }
                return syncSignatureMatches(implementation, self);
            };
        };
        return Blueprint;
    };
    if (typeof Window !== "undefined" && scope instanceof Window) {
        scope[definition.name] = definition.factory;
    } else if (typeof scope.register === "function") {
        scope.register(definition);
    } else {
        scope.name = definition.name;
        scope.dependencies = definition.dependencies;
        scope.factory = definition.factory;
    }
})(typeof module !== "undefined" && module.exports ? module.exports : Hilary && Hilary.scope ? Hilary.scope("polyn") : window);

(function(scope) {
    "use strict";
    var definition = {
        name: "polyn.exceptions",
        dependencies: [ "polyn.is" ],
        factory: undefined
    };
    definition.factory = function(is) {
        return function(exceptionHandler) {
            var self = {
                makeException: undefined,
                makeArgumentException: undefined,
                makeNotImplementedException: undefined,
                throwException: undefined
            };
            self.makeException = function(name, message, data) {
                var msg, err;
                if (typeof name === "object" && typeof name.message === "string") {
                    msg = name.message;
                    err = name;
                } else {
                    msg = typeof message === "string" ? message : name;
                    err = new Error(msg);
                }
                err.message = msg;
                if (name !== msg) {
                    err.name = name;
                }
                if (data) {
                    err.data = data;
                }
                return err;
            };
            self.makeArgumentException = function(message, argument, data) {
                var msg = typeof argument === "undefined" ? message : message + " (argument: " + argument + ")";
                return self.makeException("ArgumentException", msg, data);
            };
            self.makeNotImplementedException = function(message, data) {
                return self.makeException("NotImplementedException", message, data);
            };
            self.throwException = function(exception) {
                if (is.function(exceptionHandler)) {
                    exceptionHandler(exception);
                } else {
                    console.error(exception);
                    throw exception;
                }
            };
            return self;
        };
    };
    if (typeof Window !== "undefined" && scope instanceof Window) {
        scope[definition.name] = definition.factory;
    } else if (typeof scope.register === "function") {
        scope.register(definition);
    } else {
        scope.name = definition.name;
        scope.dependencies = definition.dependencies;
        scope.factory = definition.factory;
    }
})(typeof module !== "undefined" && module.exports ? module.exports : Hilary && Hilary.scope ? Hilary.scope("polyn") : window);

(function(scope) {
    "use strict";
    var definition = {
        name: "polyn.id",
        dependencies: [],
        factory: undefined
    };
    definition.factory = function() {
        var self = {
            createUid: undefined,
            createGuid: undefined
        }, createRandomString;
        createRandomString = function(templateString) {
            return templateString.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
                return v.toString(16);
            });
        };
        self.createUid = function(length) {
            var template;
            length = length || 12;
            template = new Array(length + 1).join("x");
            return createRandomString(template);
        };
        self.createGuid = function() {
            return createRandomString("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx");
        };
        return self;
    };
    if (typeof Window !== "undefined" && scope instanceof Window) {
        scope[definition.name] = definition.factory;
    } else if (typeof scope.register === "function") {
        scope.register(definition);
    } else {
        scope.name = definition.name;
        scope.dependencies = definition.dependencies;
        scope.factory = definition.factory;
    }
})(typeof module !== "undefined" && module.exports ? module.exports : Hilary && Hilary.scope ? Hilary.scope("polyn") : window);

(function(scope) {
    "use strict";
    var definition = {
        name: "polyn.is",
        dependencies: [],
        factory: undefined
    };
    definition.factory = function() {
        var self = {
            getType: undefined,
            defined: undefined,
            nullOrUndefined: undefined,
            "function": undefined,
            object: undefined,
            array: undefined,
            string: undefined,
            "boolean": undefined,
            datetime: undefined,
            regexp: undefined,
            number: undefined,
            nullOrWhitespace: undefined,
            money: undefined,
            decimal: undefined,
            Window: undefined,
            not: {
                defined: undefined,
                "function": undefined,
                object: undefined,
                array: undefined,
                string: undefined,
                "boolean": undefined,
                datetime: undefined,
                regexp: undefined,
                number: undefined,
                nullOrWhitespace: undefined,
                money: undefined,
                decimal: undefined,
                Window: undefined
            }
        }, class2Types = {}, class2ObjTypes = [ "Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object" ], i, name;
        for (i = 0; i < class2ObjTypes.length; i += 1) {
            name = class2ObjTypes[i];
            class2Types["[object " + name + "]"] = name.toLowerCase();
        }
        self.getType = function(obj) {
            if (typeof obj === "undefined") {
                return "undefined";
            }
            if (obj === null) {
                return String(obj);
            }
            return typeof obj === "object" || typeof obj === "function" ? class2Types[Object.prototype.toString.call(obj)] || "object" : typeof obj;
        };
        self.defined = function(obj) {
            try {
                return self.getType(obj) !== "undefined";
            } catch (e) {
                return false;
            }
        };
        self.not.defined = function(obj) {
            return self.defined(obj) === false;
        };
        self.nullOrUndefined = function(obj) {
            return self.not.defined(obj) || obj === null;
        };
        self.not.nullOrWhitespace = function(str) {
            if (typeof str === "undefined" || typeof str === null || self.not.string(str)) {
                return false;
            }
            return /([^\s])/.test(str);
        };
        self.nullOrWhitespace = function(str) {
            return self.not.nullOrWhitespace(str) === false;
        };
        self.function = function(obj) {
            return self.getType(obj) === "function";
        };
        self.not.function = function(obj) {
            return self.function(obj) === false;
        };
        self.object = function(obj) {
            return self.getType(obj) === "object";
        };
        self.not.object = function(obj) {
            return self.object(obj) === false;
        };
        self.array = function(obj) {
            return self.getType(obj) === "array";
        };
        self.not.array = function(obj) {
            return self.array(obj) === false;
        };
        self.string = function(obj) {
            return self.getType(obj) === "string";
        };
        self.not.string = function(obj) {
            return self.string(obj) === false;
        };
        self.boolean = function(obj) {
            return self.getType(obj) === "boolean";
        };
        self.not.boolean = function(obj) {
            return self.boolean(obj) === false;
        };
        self.datetime = function(obj) {
            return self.getType(obj) === "date";
        };
        self.not.datetime = function(obj) {
            return self.datetime(obj) === false;
        };
        self.regexp = function(obj) {
            return self.getType(obj) === "regexp";
        };
        self.not.regexp = function(obj) {
            return self.regexp(obj) === false;
        };
        self.number = function(obj) {
            return self.getType(obj) === "number";
        };
        self.not.number = function(obj) {
            return self.number(obj) === false;
        };
        self.money = function(val) {
            return self.defined(val) && /^(?:-)?[0-9]\d*(?:\.\d{0,2})?$/.test(val.toString());
        };
        self.not.money = function(val) {
            return self.money(val) === false;
        };
        self.decimal = function(num, places) {
            if (self.not.number(num)) {
                return false;
            }
            if (!places && self.number(num)) {
                return true;
            }
            if (!num || +(+num || 0).toFixed(places) !== +num) {
                return false;
            }
            return true;
        };
        self.not.decimal = function(val) {
            return self.decimal(val) === false;
        };
        self.Window = function(obj) {
            return self.is.defined(Window) && obj instanceof Window;
        };
        self.not.Window = function(obj) {
            return self.is.Window(obj) === false;
        };
        return self;
    };
    if (typeof Window !== "undefined" && scope instanceof Window) {
        scope[definition.name] = definition.factory;
    } else if (typeof scope.register === "function") {
        scope.register(definition);
    } else {
        scope.name = definition.name;
        scope.dependencies = definition.dependencies;
        scope.factory = definition.factory;
    }
})(typeof module !== "undefined" && module.exports ? module.exports : Hilary && Hilary.scope ? Hilary.scope("polyn") : window);

(function(scope) {
    "use strict";
    var definition = {
        name: "polyn.utils",
        dependencies: [ "polyn.is" ],
        factory: undefined
    };
    definition.factory = function(is) {
        var self = {
            runAsync: undefined
        };
        self.runAsync = function(func, highPriority) {
            if (highPriority === true && is.defined(process) && is.function(process.nextTick)) {
                process.nextTick(func);
            } else if (setImmediate) {
                setImmediate(func);
            } else {
                setTimeout(func, 0);
            }
        };
        return self;
    };
    if (typeof Window !== "undefined" && scope instanceof Window) {
        scope[definition.name] = definition.factory;
    } else if (typeof scope.register === "function") {
        scope.register(definition);
    } else {
        scope.name = definition.name;
        scope.dependencies = definition.dependencies;
        scope.factory = definition.factory;
    }
})(typeof module !== "undefined" && module.exports ? module.exports : Hilary && Hilary.scope ? Hilary.scope("polyn") : window);