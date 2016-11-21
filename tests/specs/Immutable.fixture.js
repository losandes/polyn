(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.run = Spec;
    } else if (window) {
        window.fixtures = window.fixtures || {};
        window.fixtures.Immutable = {
            run: Spec
        };
    } else {
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    function Spec (Immutable, describe, it, expect, beforeEach, afterEach) {
        describe('Immutable', function () {
            var setDefaultConfiguration = function () {
                Immutable.configure({
                    onError: function () { /*swallow*/ }
                });
            };

            // SET DEFAULTS NOW
            setDefaultConfiguration();

            describe('when given a VALID argument', function () {
                it('should NOT return an exception', function () {
                    // given
                    var Sut = makeSut(), expected, actual;

                    expected = {
                        str: 'bar',
                        num: 9,
                        validated: 42,
                        requiredProp: 'hello',
                        withSetter: 'bar'
                    };

                    // when
                    actual = new Sut(expected);

                    // then
                    expect(actual.isException).to.equal(undefined);
                    expect(actual.str).to.equal(expected.str);
                    expect(actual.num).to.equal(expected.num);
                    expect(actual.validated).to.equal(expected.validated);
                    expect(actual.requiredProp).to.equal(expected.requiredProp);
                    expect(actual.withSetter).to.equal(expected.withSetter);
                });
            });

            describe('when given an INVALID argument', function () {
                it('should return an exception', function () {
                    // given
                    var Sut = makeSut(), actual;

                    // when
                    actual = new Sut({
                        str: 9,
                        num: 'bar',
                        validated: 9,
                        requiredProp: null,
                        withSetter: 9
                    });

                    // then
                    expect(actual.isException).to.equal(true);
                });
            });

            describe('when attempting to set a property', function () {
                afterEach(setDefaultConfiguration);


                it('should return an exception', function (done) {
                    // given
                    var Sut, sut, actual;

                    Immutable.configure({
                        onError: function (err) {
                            // then
                            expect(sut.str).to.equal('bar');
                            expect(err.isException).to.equal(true);
                            expect(err.type).to.equal('ReadOnlyViolation');
                            done();
                        }
                    });

                    Sut = new Immutable({
                        str: 'string'
                    });

                    sut = new Sut({
                        str: 'bar'
                    });

                    // when
                    actual = (sut.str = 'foo');

                    // then (ALSO SEE onError (above)
                    expect(sut.str).to.equal('bar');
                });
            });

            describe('when Immutables have nested Immutables', function () {
                afterEach(setDefaultConfiguration);

                it('should cascade', function () {
                    // given
                    var Sut = makeSut(),
                        expected = {
                            str: 'bar',
                            num: 9,
                            validated: 42,
                            requiredProp: 'hello',
                            withSetter: 'bar',
                            nested: {
                                str: 'bar',
                                num: 9,
                                validated: 42,
                                requiredProp: 'hello',
                                withSetter: 'bar'
                            }
                        },
                        actual;

                    // when
                    actual = new Sut(expected);

                    // then
                    expect(actual.isException).to.equal(undefined);
                    expect(actual.str).to.equal(expected.str);
                    expect(actual.num).to.equal(expected.num);
                    expect(actual.validated).to.equal(expected.validated);
                    expect(actual.requiredProp).to.equal(expected.requiredProp);
                    expect(actual.withSetter).to.equal(expected.withSetter);

                    expect(actual.nested.str).to.equal(expected.nested.str);
                    expect(actual.nested.num).to.equal(expected.nested.num);
                    expect(actual.nested.validated).to.equal(expected.nested.validated);
                    expect(actual.nested.requiredProp).to.equal(expected.nested.requiredProp);
                    expect(actual.nested.withSetter).to.equal(expected.nested.withSetter);
                });

                it('should not allow mutation of the nested Immutables', function (done) {
                    // given
                    var Sut, sut, actual;

                    Immutable.configure({
                        onError: function (err) {
                            // then
                            expect(sut.nested.str).to.equal('baz');
                            expect(err.isException).to.equal(true);
                            expect(err.type).to.equal('ReadOnlyViolation');
                            done();
                        }
                    });

                    Sut = new Immutable({
                        str: 'string',
                        nested: new Immutable({
                            str: 'string'
                        })
                    });

                    sut = new Sut({
                        str: 'bar',
                        nested: {
                            str: 'baz'
                        }
                    });

                    // when
                    actual = (sut.nested.str = 'foo');

                    // then (ALSO SEE onError (above)
                    expect(sut.nested.str).to.equal('baz');
                });
            });

            describe('when merged with an object', function () {
                describe('and the object is VALID', function () {
                    it('should create a new object letting the object values override values in the existing immutable', function () {
                        // given
                        var Sut = new Immutable({
                                str: 'string',
                                num: 'number'
                            }),
                            sut = new Sut({
                                str: 'bar',
                                num: 9
                            }),
                            expected = {
                                str: 'foo',
                                num: 20
                            },
                            actual;

                        // when
                        actual = Sut.merge(sut, expected);

                        // then
                        expect(actual.isException).to.equal(undefined);
                        expect(actual.str).to.equal(expected.str);
                        expect(actual.num).to.equal(expected.num);
                    });
                });

                describe('and the object is INVALID', function () {
                    it('should return an error', function () {
                        // given
                        var Sut = makeSut(),
                            sut = new Sut({
                                str: 'bar',
                                num: 9,
                                validated: 42,
                                requiredProp: 'hello',
                                withSetter: 'bar'
                            }),
                            expected = {
                                str: 20,
                                num: 'foo'
                            },
                            actual;

                        // when
                        actual = Sut.merge(sut, expected);

                        // then
                        expect(actual.isException).to.equal(true);
                        expect(actual.type).to.equal('InvalidArgumentException');
                    });
                });

                describe('and the object has nested properties', function () {
                    it('should create a new object letting the object values override values in the existing immutable', function () {
                        // given
                        var Sut = makeSut(),
                            sut = new Sut({
                                str: 'bar',
                                num: 9,
                                validated: 42,
                                requiredProp: 'hello',
                                withSetter: 'bar',
                                nested: new Sut({
                                    str: 'bar',
                                    num: 9,
                                    validated: 42,
                                    requiredProp: 'hello',
                                    withSetter: 'bar',
                                    nested: new Sut({
                                        str: 'bar',
                                        num: 9,
                                        validated: 42,
                                        requiredProp: 'hello',
                                        withSetter: 'bar',
                                        nested: {
                                            str: 'bar',
                                            num: 9,
                                            validated: 42,
                                            requiredProp: 'hello',
                                            withSetter: 'bar'
                                        }
                                    })
                                })
                            }),
                            expected = {
                                str: 'foo',
                                num: 20,
                                nested: {
                                    str: 'foo',
                                    num: 20,
                                    nested: {
                                        str: 'foo',
                                        num: 20,
                                        nested: {
                                            str: 'foo',
                                            num: 20
                                        }
                                    }
                                }
                            },
                            actual,
                            validateNest;

                        // when
                        actual = Sut.merge(sut, expected);

                        // then
                        validateNest = function (actual, expected, sutNest) {
                            expect(actual.isException).to.equal(undefined);
                            expect(actual.str).to.equal(expected.str);
                            expect(actual.num).to.equal(expected.num);
                            expect(actual.validated).to.equal(sutNest.validated);
                            expect(actual.requiredProp).to.equal(sutNest.requiredProp);
                            expect(actual.withSetter).to.equal(sutNest.withSetter);
                        };

                        validateNest(actual, expected, sut);
                        validateNest(actual.nested, expected.nested, sut.nested);
                        validateNest(actual.nested.nested, expected.nested.nested, sut.nested.nested);
                        validateNest(actual.nested.nested.nested, expected.nested.nested.nested, sut.nested.nested.nested);
                    });
                });
            });

            describe('when cast to an Object', function () {
                it('should convert the entire Immutable to an Object', function () {
                    // given
                    var Sut = makeSut(),
                        sut = new Sut({
                            str: 'bar',
                            num: 9,
                            validated: 42,
                            requiredProp: 'hello',
                            withSetter: 'bar',
                            nested: new Sut({
                                str: 'bar',
                                num: 9,
                                validated: 42,
                                requiredProp: 'hello',
                                withSetter: 'bar',
                                nested: new Sut({
                                    str: 'bar',
                                    num: 9,
                                    validated: 42,
                                    requiredProp: 'hello',
                                    withSetter: 'bar',
                                    nested: {
                                        str: 'bar',
                                        num: 9,
                                        validated: 42,
                                        requiredProp: 'hello',
                                        withSetter: 'bar'
                                    }
                                })
                            })
                        }),
                        actual,
                        validateNest;

                    // when
                    actual = Sut.toObject(sut);

                    // then
                    validateNest = function (actual, sutNest) {
                        expect(actual.isException).to.equal(undefined);
                        expect(actual.str).to.equal(sutNest.str);
                        expect(actual.num).to.equal(sutNest.num);
                        expect(actual.validated).to.equal(sutNest.validated);
                        expect(actual.requiredProp).to.equal(sutNest.requiredProp);
                        expect(actual.withSetter).to.equal(sutNest.withSetter);
                    };

                    validateNest(actual, sut);
                    validateNest(actual.nested, sut.nested);
                    validateNest(actual.nested.nested, sut.nested.nested);
                    validateNest(actual.nested.nested.nested, sut.nested.nested.nested);
                });
            });

            describe('when a Date property is present on the blueprint', function () {
                // given
                var Sut = new Immutable({
                        __blueprintId: 'withDate',
                        str: 'string',
                        date: 'date'
                    }),
                    expected = {
                        str: 'bar',
                        date: new Date()
                    },
                    actual;

                // when
                actual = new Sut(expected);

                // then
                expect(actual.isException).to.equal(undefined);
                expect(actual.str).to.equal(expected.str);
                expect(Object.prototype.toString.call(actual.date)).to.equal('[object Date]');
                expect(actual.date.getTime() - expected.date.getTime() < 1000).to.equal(true);
            });

            describe('when __skipValdation is true', function () {
                it('should NOT validate objects upon construction', function () {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValdation: true
                    }), actual;

                    // when
                    actual = new Sut({});

                    // then
                    expect(actual.isException).to.equal(undefined);
                });
            });

            describe('when lazy validation is used', function () {
                it('should NOT return an error when the model is VALID', function () {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValdation: true
                    }),
                    sut = new Sut({ name: 'Andy' }),
                    actual;

                    // when
                    actual = Sut.validate(sut);

                    // then
                    expect(Array.isArray(actual.errors)).to.equal(false);
                    expect(actual.result).to.equal(true);
                });

                it('should return an error when the model is INVALID', function () {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValdation: true
                    }),
                    sut = new Sut({}),
                    actual;

                    // when
                    actual = Sut.validate(sut);

                    // then
                    expect(Array.isArray(actual.errors)).to.equal(true);
                    expect(actual.result).to.equal(false);
                });

                it('should support async validation', function (done) {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValdation: true
                    }),
                    sut = new Sut({ name: 'Andy' }),
                    actual;

                    // when
                    actual = Sut.validate(sut, function (errors, result) {
                        // then
                        expect(Array.isArray(errors)).to.equal(false);
                        expect(result).to.equal(true);
                        done();
                    });
                });
            });
        }); // /describe Immutable

        function makeSut () {
            var Sut = new Immutable({
                __blueprintId: 'LEVEL1',
                str: 'string',
                num: {
                    type: 'number'
                },
                validated: {
                    validate: function (val) {
                        if (val !== 42) {
                            return new Error('It should be 42');
                        }
                    }
                },
                requiredProp: {
                    type: 'string',
                    required: true
                },
                withSetter: {
                    set: function(val, obj) {
                        console.log('you set withSetter to: ' + val);
                        obj.withSetter = val;
                    }
                },
                nested: new Immutable({
                    __blueprintId: 'LEVEL2',
                    str: 'string',
                    num: {
                        type: 'number'
                    },
                    validated: {
                        validate: function (val) {
                            if (val !== 42) {
                                return new Error('It should be 42');
                            }
                        }
                    },
                    requiredProp: {
                        type: 'string',
                        required: true
                    },
                    withSetter: {
                        set: function(val, obj) {
                            console.log('you set withSetter to: ' + val);
                            obj.withSetter = val;
                        }
                    },
                    nested: new Immutable({
                        __blueprintId: 'LEVEL3',
                        str: 'string',
                        num: {
                            type: 'number'
                        },
                        validated: {
                            validate: function (val) {
                                if (val !== 42) {
                                    return new Error('It should be 42');
                                }
                            }
                        },
                        requiredProp: {
                            type: 'string',
                            required: true
                        },
                        withSetter: {
                            set: function(val, obj) {
                                console.log('you set withSetter to: ' + val);
                                obj.withSetter = val;
                            }
                        },
                        nested: {
                            type: 'object',
                            required: false
                        }
                    })
                })
            });

            return Sut;
        } // /makeSut
    } // /Spec

}());
