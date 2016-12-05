(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.run = Spec;
    } else if (window) {
        window.fixtures = window.fixtures || {};
        window.fixtures.objectHelper = {
            run: Spec
        };
    } else {
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    function Spec (objectHelper, describe, it, expect) {
        describe('objectHelper', function () {
            describe('copyValue', function () {
                it('should make a copy of the value', function () {
                    // given
                    var expected = 'test';

                    // when
                    var actual = objectHelper.copyValue(expected);

                    // then
                    expect(actual).to.equal(expected);
                });

                it('should NOT provide a reference to the existing property', function () {
                    // given
                    var original = {
                        name: 'test'
                    };

                    // when
                    var actual = objectHelper.copyValue(original);
                    actual.name = 'baz';

                    // then
                    expect(actual.name).to.equal('baz');
                    expect(original.name).to.equal('test');
                });

                it('should produce a Date, when the given value is a Date', function () {
                    // given
                    var expected = new Date();

                    // when
                    var actual = objectHelper.copyValue(expected);

                    // then
                    expect(typeof actual).to.equal('object');
                    expect(Object.prototype.toString.call(actual)).to.equal('[object Date]');
                });

                it('should produce a function, when the given value is a function', function () {
                    // given
                    var expectedOutput = 'test';
                    var expected = function() { return expectedOutput; };

                    // when
                    var actual = objectHelper.copyValue(expected);

                    // then
                    expect(typeof actual).to.equal('function');
                    expect(Object.prototype.toString.call(actual)).to.equal('[object Function]');
                    expect(actual()).to.equal(expectedOutput);
                });

                it('should produce an array, when the given value is an array', function () {
                    // given
                    var expectedOutput = 'test';
                    var expected = [expectedOutput];

                    // when
                    var actual = objectHelper.copyValue(expected);

                    // then
                    expect(Array.isArray(actual)).to.equal(true);
                    expect(actual[0]).to.equal(expectedOutput);
                });
            }); // /copyValue

            describe('cloneObject', function () {
                it('should make a clone of the object', function () {
                    // given
                    var original = {
                        name: 'test',
                        description: 'foo'
                    };

                    // when
                    var actual = objectHelper.cloneObject(original);

                    // then
                    expect(actual.name).to.equal(original.name);
                    expect(actual.description).to.equal(original.description);
                });

                it('should NOT provide a reference to the existing property', function () {
                    // given
                    var original = {
                        name: 'test',
                        description: 'foo'
                    };

                    // when
                    var actual = objectHelper.cloneObject(original);
                    actual.name = 'baz';
                    actual.description = 'baz';

                    // then
                    expect(actual.name).to.not.equal(original.name);
                    expect(actual.description).to.not.equal(original.description);
                });

                it('should make a deep clone of the object, by default', function () {
                    // given
                    var expectedTime = new Date().getTime(),
                        original = {
                            name: 'test',
                            date: new Date(expectedTime),
                            nest: {
                                name: 'test',
                                date: new Date(expectedTime),
                                nest: {
                                    name: 'test',
                                    date: new Date(expectedTime)
                                }
                            }
                        };

                    // when
                    var actual = objectHelper.cloneObject(original);

                    // then
                    expect(actual.name).to.equal(original.name);
                    expect((actual.date.getTime() - expectedTime) < 1000).to.equal(true);
                    expect(actual.nest.name).to.equal(original.nest.name);
                    expect((actual.nest.date.getTime() - expectedTime) < 1000).to.equal(true);
                    expect(actual.nest.nest.name).to.equal(original.nest.nest.name);
                    expect((actual.nest.nest.date.getTime() - expectedTime) < 1000).to.equal(true);
                });

                it('should make a shallow clone of the object, if deep is false', function () {
                    // given
                    var expectedTime = new Date().getTime(),
                        original = {
                            name: 'test',
                            date: new Date(expectedTime),
                            nest: {
                                name: 'test',
                                date: new Date(expectedTime),
                                nest: {
                                    name: 'test',
                                    date: new Date(expectedTime)
                                }
                            }
                        };

                    // when
                    var actual = objectHelper.cloneObject(original, false);

                    // then
                    expect(actual.name).to.equal(original.name);
                    expect((actual.date.getTime() - expectedTime) < 1000).to.equal(true);
                    expect(actual.nest).to.equal(null);
                });

                it('should have an optional async API', function (done) {
                    // given
                    var original = {
                        name: 'test',
                        description: 'foo'
                    };

                    // when
                    objectHelper.cloneObject(original, true, function (err, actual) {
                        // then
                        expect(actual.name).to.equal(original.name);
                        expect(actual.description).to.equal(original.description);
                        done();
                    });
                });
            }); // /cloneObject

            describe('merge', function () {
                it('should merge two objects into one, favoring the properties on the right', function () {
                    // given
                    var expectedTime = new Date().getTime(),
                        one = {
                            name: 'test',
                            overridden: 'never-seen',
                            nest: {
                                name: 'test',
                                overridden: 'never-seen',
                                func: function () { return 'test1'; }
                            }
                        }, two = {
                            description: 'foo',
                            overridden: 'overwritten!',
                            nest: {
                                date: new Date(expectedTime),
                                overridden: 'overwritten!',
                                func: function () { return 'test2'; }
                            }
                        };

                    // when
                    var actual = objectHelper.merge(one, two);

                    // then
                    expect(actual.name).to.equal(one.name);
                    expect(actual.description).to.equal(two.description);
                    expect(actual.overridden).to.equal(two.overridden);
                    expect(actual.nest.name).to.equal(one.nest.name);
                    expect(actual.nest.date.getTime()).to.equal(expectedTime);
                    expect(actual.nest.overridden).to.equal(two.nest.overridden);
                    expect(actual.nest.func()).to.equal('test2');
                });

                it('should merge two objects into one, favoring the properties on the right', function () {
                    // given
                    var one = {
                            name: 'test',
                            nest: {
                                func: function () { return 'test1'; }
                            }
                        }, two = {
                            name: 'test2'
                        };

                    // when
                    var actual = objectHelper.merge(one, two);

                    // then
                    expect(actual.name).to.equal(two.name);
                    expect(actual.nest.func()).to.equal('test1');
                });

                it('should produce a brand new object (should NOT provide a reference to the existing properties)', function () {
                    // given
                    var expectedTime = new Date().getTime(),
                        one = {
                            name: 'test',
                            overridden: 'never-seen',
                            nest: {
                                name: 'test',
                                overridden: 'never-seen'
                            }
                        }, two = {
                            description: 'foo',
                            overridden: 'overwritten!',
                            nest: {
                                date: new Date(expectedTime),
                                overridden: 'overwritten!'
                            }
                        };

                    // when
                    var actual = objectHelper.merge(one, two);
                    actual.name = 'baz';
                    actual.description = 'baz';
                    actual.overridden = 'baz';
                    actual.nest.name = 'baz';
                    actual.nest.date = 'baz';
                    actual.nest.date = new Date('2042-01-01');
                    actual.nest.overridden = 'baz';

                    // then
                    expect(actual.name).to.not.equal(one.name);
                    expect(actual.description).to.not.equal(two.description);
                    expect(actual.overridden).to.not.equal(two.overridden);
                    expect(actual.nest.name).to.not.equal(one.nest.name);
                    expect(actual.nest.date).to.not.equal(two.nest.date);
                    expect(actual.nest.overridden).to.not.equal(two.nest.overridden);
                });

                it('should have an async API', function (done) {
                    // given
                    var expectedTime = new Date().getTime(),
                        one = {
                            name: 'test',
                            overridden: 'never-seen',
                            nest: {
                                name: 'test',
                                overridden: 'never-seen',
                                func: function () { return 'test1'; }
                            }
                        }, two = {
                            description: 'foo',
                            overridden: 'overwritten!',
                            nest: {
                                date: new Date(expectedTime),
                                overridden: 'overwritten!',
                                func: function () { return 'test2'; }
                            }
                        };

                    // when
                    objectHelper.merge(one, two, function (err, actual) {
                        // then
                        expect(actual.name).to.equal(one.name);
                        expect(actual.description).to.equal(two.description);
                        expect(actual.overridden).to.equal(two.overridden);
                        expect(actual.nest.name).to.equal(one.nest.name);
                        expect(actual.nest.date.getTime()).to.equal(expectedTime);
                        expect(actual.nest.overridden).to.equal(two.nest.overridden);
                        expect(actual.nest.func()).to.equal('test2');
                        done();
                    });
                });
            }); // /merge

            describe('setReadOnlyProperty', function () {
                it('should add the property', function () {
                    // given
                    var expected = 'hello',
                        actual = {};

                    // when
                    objectHelper.setReadOnlyProperty(actual, 'test', expected);

                    // then
                    expect(actual.test).to.equal(expected);
                });

                it('should add a read-only property', function (done) {
                    // given
                    var expected = 'hello',
                        actual = {};

                    objectHelper.setReadOnlyProperty(actual, 'test', expected, function () {
                        // then
                        expect(actual.test).to.equal(expected);
                        done();
                    });

                    // when
                    actual.test = 'bar';
                });

                it('should be enumerable', function () {
                    // given
                    var expected = 'hello',
                        actual = {},
                        props = ['test1', 'test2', 'test3'],
                        prop,
                        i,
                        enumeratedProps = [];

                    for (i = 0; i < props.length; i += 1) {
                        objectHelper.setReadOnlyProperty(actual, props[i], expected);
                    }

                    // when
                    for (prop in actual) {
                        if (!actual.hasOwnProperty(prop)) {
                            continue;
                        }

                        if (props.indexOf(prop) > -1) {
                            enumeratedProps.push(prop);
                        }
                    }

                    expect(enumeratedProps.length).to.equal(props.length);
                });

                it('should NOT be deletable', function () {

                });
            }); // /setReadOnlyProperty
        }); // /describe async
    } // /Spec

}());
