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
                        requiredProp: 'hello'
                    };

                    // when
                    actual = new Sut(expected);

                    // then
                    expect(actual.isException).to.equal(undefined);
                    expect(actual.str).to.equal(expected.str);
                    expect(actual.num).to.equal(expected.num);
                    expect(actual.validated).to.equal(expected.validated);
                    expect(actual.requiredProp).to.equal(expected.requiredProp);
                });

                it('should NOT return the __blueprintId', function () {
                    // given
                    var Sut = new Immutable({
                            __blueprintId: 'SUT',
                            foo: 'string'
                        }),
                        actual,
                        props = [],
                        prop;

                    // when
                    actual = new Sut({ foo: 'bar' });

                    // then
                    for (prop in actual) {
                        if (actual.hasOwnProperty(prop)) {
                            props.push(prop);
                        }
                    }

                    // then
                    expect(actual.isException).to.equal(undefined);
                    expect(props.indexOf('__blueprintId')).to.equal(-1);
                });

                it('should support all is/Blueprint types', function () {
                    // given
                    var Sut = new Immutable({
                        num: 'number',
                        str: 'string',
                        arr: 'array',
                        currency: 'money',
                        bool: 'bool',
                        boolean: 'boolean',
                        date: 'datetime',
                        regex: 'regexp',
                        expression: /^[a-zA-Z]+$/,
                        obj: 'object',
                        func1: 'function',
                        func2: {
                            type: 'function',
                            args: ['arg1', 'arg2']
                        },
                        dec2: {
                            type: 'decimal',
                            places: 2
                        },
                        dec3: {
                            type: 'decimal',
                            places: 3
                        },
                        nullable: {
                            type: 'string',
                            required: false
                        },
                        custom: {
                            validate: function (val, errors) {
                                if (val !== 42) {
                                    errors.push('custom must be 42');
                                }
                            }
                        }
                    }), expected, actual;

                    expected = {
                        num: 42,
                        str: 'string',
                        arr: [1,2,3],
                        currency: 42.42,
                        bool: false,
                        boolean: false,
                        date: new Date('2017-03-05T13:36:51.000Z'),
                        regex: /[A-Za-z]/g,
                        expression: 'Hello',
                        obj: {
                            foo: 'bar'
                        },
                        func1: function (num) { return num; },
                        func2: function (arg1, arg2) {
                            return arg1 + arg2;
                        },
                        dec2: 42.12,
                        dec3: 42.123,
                        nullable: null,
                        custom: 42
                    };

                    // when
                    actual = new Sut(expected);

                    // then
                    expect(actual.isException).to.equal(undefined);
                    expect(actual.str).to.equal(expected.str);
                    expect(actual.num).to.equal(expected.num);
                    expect(actual.arr[0]).to.equal(expected.arr[0]);
                    expect(actual.arr[1]).to.equal(expected.arr[1]);
                    expect(actual.arr[3]).to.equal(expected.arr[3]);
                    expect(actual.currency).to.equal(expected.currency);
                    expect(actual.bool).to.equal(expected.bool);
                    expect(actual.boolean).to.equal(expected.boolean);
                    expect(actual.date.toISOString()).to.equal(expected.date.toISOString());
                    expect(actual.expression).to.equal(expected.expression);
                    expect('abc!@#'.match(actual.regex).length).to.equal('abc!@#'.match(expected.regex).length);
                    expect(actual.obj.foo).to.equal(expected.obj.foo);
                    expect(actual.func1(42)).to.equal(expected.func1(42));
                    expect(actual.func2(1,2)).to.equal(expected.func2(1,2));
                    expect(actual.dec2).to.equal(expected.dec2);
                    expect(actual.dec3).to.equal(expected.dec3);
                    expect(actual.nullable).to.equal(expected.nullable);
                    expect(actual.custom).to.equal(expected.custom);
                });
            });

            describe('when given an INVALID argument', function () {
                it('should return an exception', function () {
                    // given
                    var Sut = new Immutable({
                            __blueprintId: 'InvalidSut',
                            foo: 'string'
                        }),
                        actual;

                    // when
                    actual = new Sut({
                        str: 9
                    });

                    // then
                    expect(actual.isException).to.equal(true);
                    expect(actual.messages[0].indexOf('InvalidSut') > -1).to.equal(true);
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
                            withSetter: {
                                set: function (val, obj) {
                                    console.log(obj, val);
                                }
                            },
                            nested: {
                                str: 'bar',
                                num: 9,
                                validated: 42,
                                requiredProp: 'hello',
                                withSetter: {
                                    set: function (val, obj) {
                                        console.log(obj, val);
                                    }
                                }
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
                    expect(typeof actual.withSetter.set).to.equal('function');

                    expect(actual.nested.str).to.equal(expected.nested.str);
                    expect(actual.nested.num).to.equal(expected.nested.num);
                    expect(actual.nested.validated).to.equal(expected.nested.validated);
                    expect(actual.nested.requiredProp).to.equal(expected.nested.requiredProp);
                    expect(typeof actual.nested.withSetter.set).to.equal('function');
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

                it('should provide access to the nested Immutables', function () {
                    // when
                    var Person = new Immutable({
                        name: 'string',
                        address: {
                            street1: 'string'
                        }
                    });

                    var Person2 = new Immutable({
                        name: 'string',
                        address: new Immutable({
                            street1: 'string'
                        })
                    });

                    // then
                    expect(Person.Address.__immutableCtor).to.equal(true);
                    expect(Person2.Address.__immutableCtor).to.equal(true);
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

                    it('(async) should create a new object letting the object values override values in the existing immutable', function (done) {
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
                            };

                        // when
                        Sut.merge(sut, expected, function (err, actual) {
                            // then
                            expect(actual.isException).to.equal(undefined);
                            expect(actual.str).to.equal(expected.str);
                            expect(actual.num).to.equal(expected.num);
                            done();
                        });
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

                    it('should pass the error as the first arg to the callback', function () {
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
                            };

                        // when
                        Sut.merge(sut, expected, function (err) {
                            // then
                            expect(err.isException).to.equal(true);
                            expect(err.type).to.equal('InvalidArgumentException');
                        });
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
                                withSetter: {
                                    set: function (val, obj) {
                                        console.log(obj, val);
                                    }
                                },
                                nested: new Sut({
                                    str: 'bar',
                                    num: 9,
                                    validated: 42,
                                    requiredProp: 'hello',
                                    withSetter: {
                                        set: function (val, obj) {
                                            console.log(obj, val);
                                        }
                                    },
                                    nested: new Sut({
                                        str: 'bar',
                                        num: 9,
                                        validated: 42,
                                        requiredProp: 'hello',
                                        withSetter: {
                                            set: function (val, obj) {
                                                console.log(obj, val);
                                            }
                                        },
                                        nested: {
                                            str: 'bar',
                                            num: 9,
                                            validated: 42,
                                            requiredProp: 'hello',
                                            withSetter: {
                                                set: function (val, obj) {
                                                    console.log(obj, val);
                                                }
                                            }
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
                            expect(typeof actual.withSetter.set).to.equal('function');
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
                            withSetter: {
                                set: function (val, obj) {
                                    console.log(obj, val);
                                }
                            },
                            nested: new Sut({
                                str: 'bar',
                                num: 9,
                                validated: 42,
                                requiredProp: 'hello',
                                withSetter: {
                                    set: function (val, obj) {
                                        console.log(obj, val);
                                    }
                                },
                                nested: new Sut({
                                    str: 'bar',
                                    num: 9,
                                    validated: 42,
                                    requiredProp: 'hello',
                                    withSetter: {
                                        set: function (val, obj) {
                                            console.log(obj, val);
                                        }
                                    },
                                    nested: {
                                        str: 'bar',
                                        num: 9,
                                        validated: 42,
                                        requiredProp: 'hello',
                                        withSetter: {
                                            set: function (val, obj) {
                                                console.log(obj, val);
                                            }
                                        }
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
                        expect(typeof actual.withSetter.set).to.equal('function');
                    };

                    validateNest(actual, sut);
                    validateNest(actual.nested, sut.nested);
                    validateNest(actual.nested.nested, sut.nested.nested);
                    validateNest(actual.nested.nested.nested, sut.nested.nested.nested);
                });

                it('should also have an async API', function (done) {
                    // given
                    var Sut = new Immutable({
                            prop1: 'string',
                            prop2: 'string',
                            prop3: 'string'
                        }),
                        sut = new Sut({
                            prop1: 'foo',
                            prop2: 'bar',
                            prop3: 'hello'
                        });

                    // when
                    Sut.toObject(sut, function (err, actual) {
                        expect(err).to.equal(null);
                        expect(actual.prop1).to.equal(sut.prop1);
                        expect(actual.prop2).to.equal(sut.prop2);
                        expect(actual.prop3).to.equal(sut.prop3);
                        done();
                    });
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

            describe('when __skipValidation is true', function () {
                it('should NOT validate objects upon construction', function () {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValidation: true
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
                        __skipValidation: true
                    }),
                    sut = new Sut({ name: 'Trillian' }),
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
                        __skipValidation: true
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
                        __skipValidation: true
                    }),
                    sut = new Sut({ name: 'Trillian' }),
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

            describe('when lazy property validation is used', function () {
                it('should NOT return an error when the property is VALID', function () {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValidation: true
                    }),
                    sut = new Sut({ name: 'Trillian' }),
                    actual;

                    // when
                    actual = Sut.validateProperty(sut, 'name');

                    // then
                    expect(Array.isArray(actual.errors)).to.equal(false);
                    expect(actual.result).to.equal(true);
                });

                it('should return an error when the property is INVALID', function () {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValidation: true
                    }),
                    sut = new Sut({}),
                    actual;

                    // when
                    actual = Sut.validateProperty(sut, 'name');

                    // then
                    expect(Array.isArray(actual.errors)).to.equal(true);
                    expect(actual.result).to.equal(false);
                });

                it('should support async validation', function (done) {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValidation: true
                    }),
                    sut = new Sut({ name: 'Trillian' }),
                    actual;

                    // when
                    actual = Sut.validateProperty(sut, 'name', function (errors, result) {
                        // then
                        expect(Array.isArray(errors)).to.equal(false);
                        expect(result).to.equal(true);
                        done();
                    });
                });

                it('should return an error when the property is UNKNOWN', function () {
                    // given
                    var Sut = new Immutable({
                        name: 'string',
                        __skipValidation: true
                    }),
                    sut = new Sut({}),
                    actual;

                    // when
                    actual = Sut.validateProperty(sut, 'asdfgsgfs');

                    // then
                    expect(Array.isArray(actual.errors)).to.equal(true);
                    expect(actual.result).to.equal(false);
                });
            });

            describe('when constructing an Immutable', function () {
                it('should not produce a reference', function () {
                    // given
                    var Sut = new Immutable({
                            obj: 'object',
                            __skipValidation: true
                        }),
                        reference = { obj: { name: 'Trillian' } },
                        sut = new Sut(reference);

                    // when
                    reference.obj.name = 'Zaphod';

                    // then
                    expect(sut.obj.name).to.equal('Trillian');
                });
            });

            describe('when we retrieve the schema from an existing Immutable', function () {
                it('should return a copy of the original schema', function () {
                    // given
                    var expected = {
                            name: 'string',
                            obj: 'object'
                        },
                        Sut = new Immutable(expected),
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
                        Sut = new Immutable(schema);

                    // when
                    var sut = Sut.getSchema();
                    sut.obj = 'string';

                    // then
                    expect(Sut.getSchema().obj).to.equal('object');
                });

                it('should have an async API', function (done) {
                    // given
                    var expected = {
                            name: 'string',
                            obj: 'object'
                        },
                        Sut = new Immutable(expected),
                        propName;

                    // when
                    Sut.getSchema(function (err, actual) {
                        for (propName in expected) {
                            if (expected.hasOwnProperty(propName)) {
                                expect(actual[propName]).to.equal(expected[propName]);
                            }
                        }
                        done();
                    });
                });
            });

            describe('when we retrieve the Blueprint from an existing Immutable', function () {
                it('should return the expected Blueprint', function () {
                    // given
                    var expected = {
                            name: 'string',
                            obj: 'object'
                        },
                        Sut = new Immutable(expected),
                        actual,
                        propName;

                    // when
                    actual = Sut.blueprint;

                    for (propName in expected) {
                        if (expected.hasOwnProperty(propName)) {
                            expect(actual.props[propName]).to.equal(expected[propName]);
                        }
                    }
                });

                it('the blueprint should be Immutable', function () {
                    // given
                    var expected = {
                            name: 'string',
                            obj: 'object'
                        },
                        Sut = new Immutable(expected),
                        propName;

                    // when
                    Sut.blueprint.props.name = 'number';

                    for (propName in expected) {
                        if (expected.hasOwnProperty(propName)) {
                            expect(Sut.blueprint.props[propName]).to.equal(expected[propName]);
                        }
                    }
                });
            });

            describe('when an array is present', function () {
                it('should return true when passed to Array.isArray', function () {
                    var Sut = new Immutable({
                            foo: 'array'
                        }),
                        sut = new Sut({
                            foo: []
                        });

                    expect(Array.isArray(sut.foo)).to.equal(true);
                });

                it('should not support array value mutation', function () {
                    var Sut = new Immutable({
                            foo: 'array'
                        }),
                        sut = new Sut({
                            foo: []
                        });

                    try {
                        sut.foo.push('bar');
                    } catch (e) {}


                    expect(sut.foo.length).to.equal(0);
                });
            });

            describe('when a Date is present', function () {
                it('should not support date value mutation', function () {
                    var date = new Date(),
                        expectedYear = date.getYear(),
                        Sut = new Immutable({
                            foo: 'datetime'
                        }),
                        sut = new Sut({
                            foo: date
                        });

                    sut.foo.setYear(2000);

                    expect(sut.foo.getYear()).to.equal(expectedYear);
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
                    set: {
                        type: 'function',
                        args: ['val', 'obj']
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
                        set: {
                            type: 'function',
                            args: ['val', 'obj']
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
                            set: {
                                type: 'function',
                                args: ['val', 'obj']
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
