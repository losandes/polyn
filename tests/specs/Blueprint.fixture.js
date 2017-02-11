(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.run = Spec;
    } else if (window) {
        window.fixtures = window.fixtures || {};
        window.fixtures.Blueprint = {
            run: Spec
        };
    } else {
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    function Spec (Blueprint, ObjectID, id, is, describe, it, expect, beforeEach, afterEach) {
        describe('Blueprint', function () {
            var sutSetup,
                setDefaultConfiguration;

            sutSetup = function () {
                var bp = new Blueprint({
                    __blueprintId: 'bp',
                    num: 'number',
                    str: 'string',
                    arr: 'array',
                    currency: 'money',
                    bool: 'bool',
                    obj: 'object',
                    func: {
                        type: 'function',
                        args: ['arg1', 'arg2']
                    },
                    dec: {
                        type: 'decimal',
                        places: 2
                    }
                });

                return bp;
            };

            setDefaultConfiguration = function () {
                Blueprint.configure({
                    onError: function () { /*swallow*/ }
                });
            };

            // SET DEFAULT CONFIG NOW
            setDefaultConfiguration();

            describe('when a Blueprint is constructed and it has the __blueprintId property', function () {
                it('should maintain the value of the __blueprintId', function () {
                    // given
                    var uid = id.createUid(8),
                        sut;

                    // when
                    sut = new Blueprint({ __blueprintId: uid });

                    // then
                    expect(sut.__blueprintId).to.equal(uid);
                });
            });

            describe('when a Blueprint is constructed and it is missing the __blueprintId property', function () {
                it('should be given a 8 character unique identifier', function () {
                    // given
                    var sut;

                    // when
                    sut = new Blueprint({ foo: 'bar' });

                    // then
                    expect(is.string(sut.__blueprintId)).to.equal(true);
                    expect(sut.__blueprintId.length).to.equal(8);
                });
            });

            describe('asynchronous validation', function () {
                describe('when an object that implements a given Blueprint is validated', function () {
                    var sut = sutSetup(),
                        implementation = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            func: function (arg1, arg2) {
                                console.log(arg1, arg2);
                            },
                            dec: 42.42
                        };


                    it('should pass TRUE in as the second argument to the callback', function (done) {
                        // when
                        Blueprint.validate(sut, implementation, function (err, result) {
                            // then
                            expect(result).to.equal(true);
                            done();
                        });
                    });

                    it('(Inline) should pass TRUE in as the second argument to the callback', function (done) {
                        // when
                        sut.signatureMatches(implementation, function (err, result) {
                            // then
                            expect(result).to.equal(true);
                            done();
                        });
                    });

                    describe('and the implementation has additional properties', function () {
                        var implementation = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            func: function (arg1, arg2) {
                                console.log(arg1, arg2);
                            },
                            dec: 42.42,
                            foo: 'foo',
                            bar: 'bar'
                        };

                        it('should pass TRUE in as the second argument to the callback', function (done) {
                            // when
                            Blueprint.validate(sut, implementation, function (err, result) {
                                // then
                                expect(result).to.equal(true);
                                done();
                            });
                        });

                        it('(Inline) should pass TRUE in as the second argument to the callback', function (done) {
                            // when
                            sut.signatureMatches(implementation, function (err, result) {
                                // then
                                expect(result).to.equal(true);
                                done();
                            });
                        });
                    });
                });

                describe('when an object that does NOT implement a given Blueprint is validated', function () {
                    var sut = sutSetup(),
                        implementation = {},
                        implementation2 = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            dec: 42.42
                        };


                    it('should pass FALSE in as the second argument to the callback', function (done) {
                        // when
                        Blueprint.validate(sut, implementation, function (err, result) {
                            // then
                            expect(result).to.equal(false);
                            done();
                        });
                    });

                    it('(Inline) should FALSE in as the second argument to the callback', function (done) {
                        // when
                        sut.signatureMatches(implementation, function (err, result) {
                            // then
                            expect(result).to.equal(false);
                            done();
                        });
                    });

                    it('should pass an array of errors as the first argument to the callback', function (done) {
                        // when
                        Blueprint.validate(sut, implementation, function (err) {
                            // then
                            expect(is.array(err)).to.equal(true);
                            expect(err.length).to.be.at.least(5);
                            done();
                        });
                    });

                    it('(Inline) should pass an array of errors as the first argument to the callback', function (done) {
                        // when
                        sut.signatureMatches(implementation, function (err) {
                            // then
                            expect(is.array(err)).to.equal(true);
                            expect(err.length).to.be.at.least(5);
                            done();
                        });
                    });

                    it('should pass an array of errors as the first argument to the callback', function (done) {
                        // when
                        Blueprint.validate(sut, implementation2, function (err) {
                            // then
                            expect(is.array(err)).to.equal(true);
                            // there should be an error that a function is missing
                            // and another that it is missing arguments
                            // for a total of 2 errors
                            expect(err.length).to.equal(2);
                            done();
                        });
                    });

                    it('(Inline) should pass an array of errors as the first argument to the callback', function (done) {
                        // when
                        sut.signatureMatches(implementation2, function (err) {
                            // then
                            expect(is.array(err)).to.equal(true);
                            // there should be an error that a function is missing
                            // and another that it is missing arguments
                            // for a total of 2 errors
                            expect(err.length).to.equal(2);
                            done();
                        });
                    });

                });

                describe('when a Blueprint property has it\'s own validate function', function () {
                    var expectedValidationErrorMessage = 'validation message',
                        validSut = new Blueprint({
                            prop: {
                                validate: function (implementationProperty, errors, implementation) {
                                    // then
                                    expect(implementationProperty).to.equal(42);
                                    expect(Array.isArray(errors)).to.equal(true);
                                    expect(implementation.prop).to.equal(42);
                                }
                            }
                        }),
                        invalidSut = new Blueprint({
                            prop: {
                                validate: function (implementationProperty, errors) {
                                    // then
                                    errors.push(expectedValidationErrorMessage);
                                }
                            }
                        }),
                        implementation = {
                            prop: 42
                        };

                    it('should receive three arguments', function (done) {
                        // when
                        Blueprint.validate(validSut, implementation, function (err, result) {
                            // then
                            expect(result).to.equal(true);
                            done();
                        });
                    });

                    it('(Inline) should receive three arguments', function (done) {
                        // when
                        validSut.signatureMatches(implementation, function (err, result) {
                            // then
                            expect(result).to.equal(true);
                            done();
                        });
                    });

                    it('should execute the validate function instead of using the built in validation', function (done) {
                        // when
                        Blueprint.validate(invalidSut, implementation, function (err, result) {
                            // then
                            expect(err[0]).to.equal(expectedValidationErrorMessage);
                            expect(result).to.equal(false);
                            done();
                        });
                    });

                    it('(Inline) should execute the validate function instead of using the built in validation', function (done) {
                        // when
                        invalidSut.signatureMatches(implementation, function (err, result) {
                            // then
                            expect(err[0]).to.equal(expectedValidationErrorMessage);
                            expect(result).to.equal(false);
                            done();
                        });
                    });
                });

                describe('when a Blueprint property IS required', function () {
                    var sut = new Blueprint({
                            prop1: 'number',
                            prop: {
                                type: 'string',
                                required: true
                            }
                        }),
                        implementation = {
                            prop1: 42
                        };

                    it('should require the property to have a value', function (done) {
                        // when
                        Blueprint.validate(sut, implementation, function (err, result) {
                            // then
                            expect(result).to.equal(false);
                            done();
                        });
                    });

                    it('(Inline) should require the property to have a value', function (done) {
                        // when
                        sut.signatureMatches(implementation, function (err, result) {
                            // then
                            expect(result).to.equal(false);
                            done();
                        });
                    });
                });

                describe('when a Blueprint property is NOT required', function () {
                    var sut = new Blueprint({
                            prop1: 'number',
                            prop: {
                                type: 'string',
                                required: false
                            }
                        }),
                        implementation = {
                            prop1: 42
                        };

                    it('should NOT require the property to have a value', function (done) {
                        // when
                        Blueprint.validate(sut, implementation, function (err, result) {
                            // then
                            expect(result).to.equal(true);
                            done();
                        });
                    });

                    it('(Inline) should NOT require the property to have a value', function (done) {
                        // when
                        sut.signatureMatches(implementation, function (err, result) {
                            // then
                            expect(result).to.equal(true);
                            done();
                        });
                    });
                });
            });

            describe('synchronous validation', function () {
                describe('when an object that implements a given Blueprint is validated', function () {
                    var sut = sutSetup(),
                        implementation = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            func: function (arg1, arg2) {
                                console.log(arg1, arg2);
                            },
                            dec: 42.42
                        };


                    it('should return TRUE for the `result` property', function () {
                        // when
                        var actual = Blueprint.validate(sut, implementation);

                        // then
                        expect(actual.result).to.equal(true);
                    });

                    it('(Inline) should return TRUE for the `result` property', function () {
                        // when
                        var actual = sut.syncSignatureMatches(implementation);

                        // then
                        expect(actual.result).to.equal(true);
                    });

                    describe('and the implementation has additional properties', function () {
                        var implementation = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            func: function (arg1, arg2) {
                                console.log(arg1, arg2);
                            },
                            dec: 42.42,
                            foo: 'foo',
                            bar: 'bar'
                        };

                        it('should return TRUE for the `result` property', function () {
                            // when
                            var actual = Blueprint.validate(sut, implementation);

                            // then
                            expect(actual.result).to.equal(true);
                        });

                        it('(Inline) should return TRUE for the `result` property', function () {
                            // when
                            var actual = sut.syncSignatureMatches(implementation);

                            // then
                            expect(actual.result).to.equal(true);
                        });
                    });
                });

                describe('when an object that does NOT implement a given Blueprint is validated', function () {
                    var sut = sutSetup(),
                        implementation = {},
                        implementation2 = {
                            num: 42,
                            str: 'string',
                            arr: [],
                            currency: '42.42',
                            bool: true,
                            obj: {
                                foo: 'bar'
                            },
                            dec: 42.42
                        };


                    it('should return TRUE for the `result` property', function () {
                        // when
                        var actual = Blueprint.validate(sut, implementation);
                        // then
                        expect(actual.result).to.equal(false);
                    });

                    it('(Inline) should return TRUE for the `result` property', function () {
                        // when
                        var actual = sut.syncSignatureMatches(implementation);
                        // then
                        expect(actual.result).to.equal(false);
                    });

                    it('should return an array of errors', function () {
                        // when
                        var actual = Blueprint.validate(sut, implementation);
                        // then
                        expect(is.array(actual.errors)).to.equal(true);
                        expect(actual.errors.length).to.be.at.least(5);
                    });

                    it('(Inline) should return an array of errors', function () {
                        // when
                        var actual = sut.syncSignatureMatches(implementation);
                        // then
                        expect(is.array(actual.errors)).to.equal(true);
                        expect(actual.errors.length).to.be.at.least(5);
                    });

                    it('should return an array of errors', function () {
                        // when
                        var actual = Blueprint.validate(sut, implementation2);
                        // then
                        expect(is.array(actual.errors)).to.equal(true);
                        // there should be an error that a function is missing
                        // and another that it is missing arguments
                        // for a total of 2 errors
                        expect(actual.errors.length).to.equal(2);
                    });

                    it('(Inline) should return an array of errors', function () {
                        // when
                        var actual = sut.syncSignatureMatches(implementation2);
                        // then
                        expect(is.array(actual.errors)).to.equal(true);
                        // there should be an error that a function is missing
                        // and another that it is missing arguments
                        // for a total of 2 errors
                        expect(actual.errors.length).to.equal(2);
                    });

                });

                describe('when a Blueprint property has it\'s own validate function', function () {
                    var expectedValidationErrorMessage = 'validation message',
                        validSut = new Blueprint({
                            prop: {
                                validate: function (implementationProperty, errors, implementation) {
                                    // then
                                    expect(implementationProperty).to.equal(42);
                                    expect(Array.isArray(errors)).to.equal(true);
                                    expect(implementation.prop).to.equal(42);
                                }
                            }
                        }),
                        invalidSut = new Blueprint({
                            prop: {
                                validate: function (implementationProperty, errors) {
                                    // then
                                    errors.push(expectedValidationErrorMessage);
                                }
                            }
                        }),
                        implementation = {
                            prop: 42
                        };

                    it('should receive three arguments', function () {
                        // when
                        var actual = Blueprint.validate(validSut, implementation);
                        // then
                        expect(actual.result).to.equal(true);
                    });

                    it('(Inline) should receive three arguments', function () {
                        // when
                        var actual = validSut.syncSignatureMatches(implementation);
                        // then
                        expect(actual.result).to.equal(true);
                    });

                    it('should execute the validate function instead of using the built in validation', function () {
                        // when
                        var actual = Blueprint.validate(invalidSut, implementation);
                        // then
                        expect(actual.errors[0]).to.equal(expectedValidationErrorMessage);
                        expect(actual.result).to.equal(false);
                    });

                    it('(Inline) should execute the validate function instead of using the built in validation', function () {
                        // when
                        var actual = invalidSut.syncSignatureMatches(implementation);
                        // then
                        expect(actual.errors[0]).to.equal(expectedValidationErrorMessage);
                        expect(actual.result).to.equal(false);
                    });
                });

                describe('when a Blueprint property IS required', function () {
                    var sut = new Blueprint({
                            prop1: 'number',
                            prop: {
                                type: 'string',
                                required: true
                            }
                        }),
                        implementation = {
                            prop1: 42
                        };

                    it('should require the property to have a value', function () {
                        // when
                        var actual = Blueprint.validate(sut, implementation);
                        // then
                        expect(actual.result).to.equal(false);
                    });

                    it('(Inline) should require the property to have a value', function () {
                        // when
                        var actual = sut.syncSignatureMatches(implementation);
                        // then
                        expect(actual.result).to.equal(false);
                    });
                });

                describe('when a Blueprint property is NOT required', function () {
                    var sut = new Blueprint({
                            prop1: 'number',
                            prop: {
                                type: 'string',
                                required: false
                            }
                        }),
                        implementation = {
                            prop1: 42
                        };

                    it('should NOT require the property to have a value', function () {
                        // when
                        var actual = Blueprint.validate(sut, implementation);
                        // then
                        expect(actual.result).to.equal(true);
                    });

                    it('(Inline) should NOT require the property to have a value', function () {
                        // when
                        var actual = sut.syncSignatureMatches(implementation);
                        // then
                        expect(actual.result).to.equal(true);
                    });
                });
            });

            describe('when blueprints are merged', function () {
                var setup = function () {
                    return {
                        bp1: new Blueprint({
                            __blueprintId: 'BP1',
                            name: 'string'
                        }),
                        bp2: new Blueprint({
                            __blueprintId: 'BP2',
                            name: 'number',
                            description: 'string'
                        }),
                        bp3: new Blueprint({
                            __blueprintId: 'BP3',
                            name: 'number',
                            description: 'number',
                            something: 'string'
                        })
                    };
                };

                it('should combine the blueprints into one, retaining the id of the first blueprint', function (done) {
                    // given
                    var sut = setup();

                    // when
                    Blueprint.merge([sut.bp1, sut.bp2, sut.bp3], function (err, actual) {
                        // then
                        expect(err).to.equal(null);
                        expect(actual.__blueprintId).to.equal(sut.bp1.__blueprintId);
                        expect(actual.props.name).to.equal('string');
                        expect(actual.props.description).to.equal('string');
                        expect(actual.props.something).to.equal('string');
                        done();
                    });
                });

                it('should combine the blueprints into one, retaining the id of the first blueprint', function (done) {
                    // given
                    var sut = setup();

                    // when
                    Blueprint.merge([sut.bp3, sut.bp2, sut.bp1], function (err, actual) {
                        // then
                        expect(err).to.equal(null);
                        expect(actual.__blueprintId).to.equal(sut.bp3.__blueprintId);
                        done();
                    });
                });

                it('should respect precedence from left to right', function (done) {
                    // given
                    var sut = setup();

                    // when
                    Blueprint.merge([sut.bp1, sut.bp2, sut.bp3], function (err, actual) {
                        // then
                        expect(err).to.equal(null);
                        expect(actual.__blueprintId).to.equal(sut.bp1.__blueprintId);
                        expect(actual.props.name).to.equal('string');
                        expect(actual.props.description).to.equal('string');
                        expect(actual.props.something).to.equal('string');
                        done();
                    });
                });
            });

            describe('when blueprints are synchronously merged', function () {
                var setup = function () {
                    return {
                        bp1: new Blueprint({
                            __blueprintId: 'BP1',
                            name: 'string'
                        }),
                        bp2: new Blueprint({
                            __blueprintId: 'BP2',
                            name: 'number',
                            description: 'string'
                        }),
                        bp3: new Blueprint({
                            __blueprintId: 'BP3',
                            name: 'number',
                            description: 'number',
                            something: 'string'
                        })
                    };
                };

                it('should combine the blueprints into one, retaining the id of the first blueprint', function () {
                    // given
                    var sut = setup();

                    // when
                    var actual = Blueprint.syncMerge([sut.bp1, sut.bp2, sut.bp3]);

                    // then
                    expect(actual.__blueprintId).to.equal(sut.bp1.__blueprintId);
                    expect(actual.props.name).to.equal('string');
                    expect(actual.props.description).to.equal('string');
                    expect(actual.props.something).to.equal('string');
                });

                it('should combine the blueprints into one, retaining the id of the first blueprint', function () {
                    // given
                    var sut = setup();

                    // when
                    var actual = Blueprint.syncMerge([sut.bp3, sut.bp2, sut.bp1]);
                    // then
                    expect(actual.__blueprintId).to.equal(sut.bp3.__blueprintId);
                });

                it('should respect precedence from left to right', function () {
                    // given
                    var sut = setup();

                    // when
                    var actual = Blueprint.syncMerge([sut.bp1, sut.bp2, sut.bp3]);
                    // then
                    expect(actual.__blueprintId).to.equal(sut.bp1.__blueprintId);
                    expect(actual.props.name).to.equal('string');
                    expect(actual.props.description).to.equal('string');
                    expect(actual.props.something).to.equal('string');
                });

                it('(Inline) should combine the blueprints into one, retaining the id of the first blueprint', function () {
                    // given
                    var sut = setup();

                    // when
                    var actual = sut.bp1.inherits(sut.bp2);

                    // then
                    expect(actual.__blueprintId).to.equal(sut.bp1.__blueprintId);
                    expect(actual.props.name).to.equal('string');
                    expect(actual.props.description).to.equal('string');
                    expect(sut.bp1.props.name).to.equal('string');
                    expect(sut.bp1.props.description).to.equal('string');
                });

                it('(Inline) should combine the blueprints into one, retaining the id of the first blueprint', function () {
                    // given
                    var sut = setup();

                    // when
                    var actual = sut.bp3.inherits(sut.bp2);
                    // then
                    expect(actual.__blueprintId).to.equal(sut.bp3.__blueprintId);
                });

                it('(Inline) should respect precedence from left to right', function () {
                    // given
                    var sut = setup();

                    // when
                    var actual = sut.bp2.inherits(sut.bp1);
                    // then
                    expect(actual.__blueprintId).to.equal(sut.bp2.__blueprintId);
                    expect(actual.props.name).to.equal('number');
                    expect(actual.props.description).to.equal('string');
                    expect(sut.bp2.props.name).to.equal('number');
                    expect(sut.bp2.props.description).to.equal('string');
                });
            });

            describe('when defining Blueprint functions', function () {
                it('The args property should be optional', function () {
                    // given
                    var bp1 = new Blueprint({
                            func: {
                                type: 'function'
                            }
                        }),
                        imp1 = {
                            func: function () {}
                        },
                        actual;

                    // when
                    actual = bp1.syncSignatureMatches(imp1);

                    // then
                    expect(actual.result).to.equal(true);
                });

                it('can be defined without an object literal', function () {
                    // given
                    var bp1 = new Blueprint({
                            func: 'function'
                        }),
                        imp1 = {
                            func: function () {}
                        },
                        actual;

                    // when
                    actual = bp1.syncSignatureMatches(imp1);

                    // then
                    expect(actual.result).to.equal(true);
                });
            });

            describe('when a Blueprint has nested Blueprints', function () {
                it('should return a happy result if both Blueprints are satisfied', function () {
                    // given
                    var actual,
                        bp1 = new Blueprint({
                            name: 'string'
                        }),
                        bp2 = new Blueprint({
                            description: 'string',
                            parent: {
                                type: 'blueprint',
                                blueprint: bp1
                            }
                        }),
                        impl = {
                            description: 'hello',
                            parent: {
                                name: 'foo'
                            }
                        };

                    // when
                    actual = bp2.syncSignatureMatches(impl);

                    // then
                    expect(actual.result).to.equal(true);
                    expect(actual.errors).to.equal(null);

                });

                it('should return a sad result if both Blueprints are not satisfied', function () {
                    // given
                    var actual,
                        bp1 = new Blueprint({
                            name: 'string',
                            desc: 'string',
                            lol: 'string'
                        }),
                        bp2 = new Blueprint({
                            description: 'string',
                            parent: {
                                type: 'blueprint',
                                blueprint: bp1
                            }
                        }),
                        impl = {
                            description: 'hello',
                            parent: {
                                name: 'foo'
                            }
                        };

                    // when
                    actual = bp2.syncSignatureMatches(impl);

                    // then
                    expect(actual.result).to.equal(false);
                    expect(actual.errors.length).to.equal(2);

                });
            });

            describe('validation memory', function () {
                it('should remember validation by default', function () {
                    // given
                    var expectedId = 'MEMORY',
                        blueprint = new Blueprint({
                            __blueprintId: expectedId,
                            name: 'string'
                        }),
                        implementation = {
                            name: 'Trillian'
                        };

                    // when
                    blueprint.validate(implementation);

                    // then
                    expect(implementation.__interfaces[expectedId]).to.equal(true);
                });

                describe('when compatibility is set after 2016-11-19', function () {
                    beforeEach(function () {
                        Blueprint.configure({
                            compatibility: '2016-11-21'
                        });
                    });

                    afterEach(function () {
                        setDefaultConfiguration();
                    });

                    it('should NOT remember validation when compatibility is set after 2016-11-19', function () {
                        // given
                        var blueprint = new Blueprint({
                                __blueprintId: 'MEMORY',
                                name: 'string'
                            }),
                            implementation = {
                                name: 'Trillian'
                            };

                        // when
                        blueprint.validate(implementation);

                        // then
                        expect(implementation.__interfaces).to.equal(undefined);
                        expect(implementation.__blueprints).to.equal(undefined);
                    });
                });

                describe('when compatibility is set after 2016-11-19, but rememberValidation is turned on', function () {
                    beforeEach(function () {
                        Blueprint.configure({
                            compatibility: '2016-11-21',
                            rememberValidation: true
                        });
                    });

                    afterEach(function () {
                        setDefaultConfiguration();
                    });

                    it('should NOT remember validation when compatibility is set after 2016-11-19', function () {
                        // given
                        var expectedId = 'MEMORY',
                            blueprint = new Blueprint({
                                __blueprintId: expectedId,
                                name: 'string'
                            }),
                            implementation = {
                                name: 'Trillian'
                            };

                        // when
                        blueprint.validate(implementation);

                        // then
                        expect(implementation.__blueprints[expectedId]).to.equal(true);
                    });
                });
            });

            describe('validateProperty', function () {
                describe('when a VALID property is validated', function () {
                    it('should callback a true result', function (done) {
                        // given
                        var bp = new Blueprint({
                                name: 'string'
                            });

                        // when
                        Blueprint.validateProperty(bp, 'name', 'Trillian', function (errors, result) {
                            // then
                            expect(errors).to.equal(null);
                            expect(result).to.equal(true);
                            done();
                        });
                    });

                    it('(INLINE) should callback a true result', function (done) {
                        // given
                        var bp = new Blueprint({
                                name: 'string'
                            });

                        // when
                        bp.validateProperty('name', 'Trillian', function (errors, result) {
                            // then
                            expect(errors).to.equal(null);
                            expect(result).to.equal(true);
                            done();
                        });
                    });

                    it('should return a true result', function () {
                        // given
                        var bp = new Blueprint({
                                name: 'string'
                            });

                        // when
                        var actual = Blueprint.validateProperty(bp, 'name', 'Trillian');

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(false);
                        expect(actual.result).to.equal(true);
                    });

                    it('(INLINE) should return a true result', function () {
                        // given
                        var bp = new Blueprint({
                                name: 'string'
                            });

                        // when
                        var actual = bp.validateProperty('name', 'Trillian');

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(false);
                        expect(actual.result).to.equal(true);
                    });

                    it('should work without a real Blueprint', function () {
                        // given
                        var bp = { name: 'string' };

                        // when
                        var actual = Blueprint.validateProperty(bp, 'name', 'Trillian');

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(false);
                        expect(actual.result).to.equal(true);
                    });
                });

                describe('when an INVALID property is validated', function () {
                    it('should callback a false result', function (done) {
                        // given
                        var bp = new Blueprint({
                                name: 'string'
                            });

                        // when
                        Blueprint.validateProperty(bp, 'name', 123, function (errors, result) {
                            // then
                            expect(Array.isArray(errors)).to.equal(true);
                            expect(result).to.equal(false);
                            done();
                        });
                    });

                    it('(INLINE) should callback a false result', function (done) {
                        // given
                        var bp = new Blueprint({
                                name: 'string'
                            });

                        // when
                        bp.validateProperty('name', 123, function (errors, result) {
                            // then
                            expect(Array.isArray(errors)).to.equal(true);
                            expect(result).to.equal(false);
                            done();
                        });
                    });

                    it('should return a false result', function () {
                        // given
                        var bp = new Blueprint({
                                name: 'string'
                            });

                        // when
                        var actual = Blueprint.validateProperty(bp, 'name', 123);

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(true);
                        expect(actual.result).to.equal(false);
                    });

                    it('(INLINE) should return a false result', function () {
                        // given
                        var bp = new Blueprint({
                                name: 'string'
                            });

                        // when
                        var actual = bp.validateProperty('name', 123);

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(true);
                        expect(actual.result).to.equal(false);
                    });

                    it('should work without a real Blueprint', function () {
                        // given
                        var bp = { name: 'string' };

                        // when
                        var actual = Blueprint.validateProperty(bp, 'name', 123);

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(true);
                        expect(actual.result).to.equal(false);
                    });
                });
            });

            describe('regular expressions', function () {
                describe('when the expected value type is a regular expression', function () {
                    it('should validate the value', function () {
                        // given
                        var bp = new Blueprint({
                            expression: 'regexp'
                        });

                        // when
                        var actual = bp.validate({
                            expression: /^book$/
                        });

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(false);
                        expect(actual.result).to.equal(true);
                    });

                    it('should validate the value', function () {
                        // given
                        var bp = new Blueprint({
                            expression: 'regexp'
                        });

                        // when
                        var actual = bp.validate({
                            expression: 'book'
                        });

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(true);
                        expect(actual.result).to.equal(false);
                    });

                    it('should validate the value', function () {
                        // given
                        var bp = new Blueprint({
                            expression: {
                                type: 'regexp',
                                required: false
                            }
                        });

                        // when
                        var actual = bp.validate({
                            expression: /^book$/
                        });

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(false);
                        expect(actual.result).to.equal(true);
                    });

                    it('should validate the value', function () {
                        // given
                        var bp = new Blueprint({
                            expression: {
                                type: 'regexp',
                                required: false
                            }
                        });

                        // when
                        var actual = bp.validate({});

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(false);
                        expect(actual.result).to.equal(true);
                    });
                });

                describe('when the value should be validated against an expression', function () {
                    it('should validate the value', function () {
                        // given
                        var bp = new Blueprint({
                            expression: /^book$/
                        });

                        // when
                        var actual = bp.validate({
                            expression: 'book'
                        });

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(false);
                        expect(actual.result).to.equal(true);
                    });

                    it('should validate the value', function () {
                        // given
                        var bp = new Blueprint({
                            __blueprintId: 'REGEXP1',
                            exp: /^book$/
                        });

                        // when
                        var actual = bp.validate({
                            exp: 'frank'
                        });

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(true);
                        expect(actual.result).to.equal(false);
                    });

                    it('should validate the value', function () {
                        // given
                        var bp = new Blueprint({
                            expression: {
                                type: 'expression',
                                expression: /^book$/,
                                required: false
                            }
                        });

                        // when
                        var actual = bp.validate({
                            expression: 'books!'
                        });

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(true);
                        expect(actual.result).to.equal(false);
                    });

                    it('should validate the value', function () {
                        // given
                        var bp = new Blueprint({
                            expression: {
                                type: 'expression',
                                expression: /^book$/,
                                required: false
                            }
                        });

                        // when
                        var actual = bp.validate({});

                        // then
                        expect(Array.isArray(actual.errors)).to.equal(false);
                        expect(actual.result).to.equal(true);
                    });
                });
            });

            if (ObjectID) {
                describe('ObjectID', function () {
                    describe('when the expected value type is an ObjectID', function () {
                        it('should validate the value', function () {
                            // given
                            var bp = new Blueprint({
                                __blueprintId: 'ObjectID',
                                _id: 'ObjectID'
                            });

                            // when
                            var actual = bp.validate({
                                _id: new ObjectID()
                            });

                            // then
                            expect(Array.isArray(actual.errors)).to.equal(false);
                            expect(actual.result).to.equal(true);
                        });

                        it('should validate the value', function () {
                            // given
                            var bp = new Blueprint({
                                _id: 'ObjectID'
                            });

                            // when
                            var actual = bp.validate({
                                _id: new ObjectID().toHexString()
                            });

                            // then
                            expect(Array.isArray(actual.errors)).to.equal(true);
                            expect(actual.result).to.equal(false);
                        });
                    });
                });
            }

            describe('when an unrecognized type is presented', function () {
                it('should skip validation of those properties', function () {
                    // given
                    var bp = new Blueprint({
                        name: 'blahalaldfj'
                    });

                    // when
                    var actual = bp.validate({ name: 123 });

                    // then
                    expect(actual.result).to.equal(true);
                    expect(Array.isArray(actual.errors)).to.equal(false);
                });

                it('should skip validation of those properties', function () {
                    // given
                    var bp = new Blueprint({
                        name: {
                            type: 'blahalaldfj',
                            required: true
                        }
                    });

                    // when
                    var actual = bp.validate({ name: 123 });

                    // then
                    expect(actual.result).to.equal(true);
                    expect(Array.isArray(actual.errors)).to.equal(false);
                });
            });

            describe('when an object with unrecognized validation information is presented', function () {
                it('should skip validation of those properties', function () {
                    // given
                    var bp = new Blueprint({
                        name: {
                            set: function () {}
                        }
                    });

                    // when
                    var actual = bp.validate({ name: 123 });

                    // then
                    expect(actual.result).to.equal(true);
                    expect(Array.isArray(actual.errors)).to.equal(false);
                });
            });

            describe('when we retrieve the schema from an existing Blueprint', function () {
                it('should return a copy of the original schema', function () {
                    // given
                    var expected = {
                            name: 'string',
                            obj: 'object'
                        },
                        Sut = new Blueprint(expected),
                        actual,
                        propName;

                    // when
                    actual = Sut.getSchema();

                    for (propName in expected) {
                        if (expected.hasOwnProperty(propName)) {
                            expect(actual[propName]).to.equal(expected[propName]);
                        }
                    }
                });

                it('should NOT return a reference of the original schema', function () {
                    // given
                    var schema = {
                            obj: 'object'
                        },
                        Sut = new Blueprint(schema);

                    // when
                    var sut = Sut.getSchema();
                    sut.obj = 'string';

                    // then
                    expect(Sut.getSchema().obj).to.equal('object');
                });
            });

            describe('when accessing the properties of a Blueprint', function () {
                it('the properties on a blueprint should be Immutable', function () {
                    // given
                    var expected = {
                            name: 'string',
                            obj: 'object'
                        },
                        sut = new Blueprint(expected),
                        propName;

                    // when
                    sut.props.name = 'number';

                    for (propName in expected) {
                        if (expected.hasOwnProperty(propName)) {
                            expect(sut.props[propName]).to.equal(expected[propName]);
                        }
                    }
                });
            });

        }); // /describe Blueprint
    } // /Spec

}());
