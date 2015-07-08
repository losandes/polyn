
/*jshint mocha: true, unused: false*/
/*globals describe, it*/
'use strict';

var expect = require('chai').expect,
    is = require('../../src/is.js').factory(),
    utils = require('../../src/utils.js').factory(is),
    id = require('../../src/id.js').factory(),
    Blueprint = require('../../src/Blueprint.js').factory(utils, is, id),
    sutSetup;

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
    
    return {
        blueprint: bp
    };
};

describe('Blueprint, ', function () {
    
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

    describe('when an object that implements a given Blueprint is passed as an argument to signatureMatches', function () {

        it('should pass true in as the second argument to the callback', function (done) {
            // given
            var sut = sutSetup(),
                obj = {
                    num: 42,
                    str: 'string',
                    arr: [],
                    currency: '42.42',
                    bool: true,
                    obj: {
                        foo: 'bar'
                    },
                    func: function (arg1, arg2) {},
                    dec: 42.42
                };

            // when
            sut.blueprint.signatureMatches(obj, function (err, result) {
                // then
                expect(result).to.equal(true);
                done();
            });

        });
        
        it('should pass true in as the second argument to the callback, even when there are additional properties', function (done) {
            // given
            var sut = sutSetup(),
                obj = {
                    num: 42,
                    str: 'string',
                    arr: [],
                    currency: '42.42',
                    bool: true,
                    obj: {
                        foo: 'bar'
                    },
                    func: function (arg1, arg2) {},
                    dec: 42.42,
                    foo: 'foo',
                    bar: 'bar'
                };

            // when
            sut.blueprint.signatureMatches(obj, function (err, result) {
                // then
                expect(result).to.equal(true);
                done();
            });

        });

    });
    
    describe('when an object that does not implement a given Blueprint is passed as an argument to signatureMatches', function () {

        it('should pass false in as the second argument to the callback', function (done) {
            // given
            var sut = sutSetup(),
                obj = {};

            // when
            sut.blueprint.signatureMatches(obj, function (err, result) {
                // then
                expect(result).to.equal(false);
                done();
            });

        });
        
        it('should pass an array of errors in as the first argument to the callback', function (done) {
            // given
            var sut = sutSetup(),
                obj = {};

            // when
            sut.blueprint.signatureMatches(obj, function (err, result) {
                // then
                expect(is.array(err)).to.equal(true);
                expect(err.length).to.be.at.least(5);
                done();
            });

        });
        
        it('should pass an array of errors in as the first argument to the callback', function (done) {
            // given
            var sut = sutSetup(),
                obj = {
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

            // when
            sut.blueprint.signatureMatches(obj, function (err, result) {
                // then
                expect(result).to.equal(false);

                // there should be an error that a function is missing
                // and another that it is missing arguments
                // for a total of 2 errors
                expect(err.length).to.equal(2);
                done();
            });

        });

    });
    
    describe('when a Blueprint property is an object and has a validate function', function () {
    
        it('should execute the validate function instead of using the built in validation', function (done) {
            // given
            var bp = new Blueprint({
                    prop: {
                        validate: function (implementationProperty, errorArray) {
                            // then
                            expect(implementationProperty).to.equal(42);
                            done();
                        }
                    }
                }),
                implementation = {
                    prop: 42
                };
            
            // when
            bp.signatureMatches(implementation, function (err, result) {
                /*ingore: we're making sure the validate function was actually called*/
            });
        });
        
        it('should allow the validate function to affect the signatureMatches result', function (done) {
            // given
            var errorMessage = 'error message',
                bp = new Blueprint({
                    prop: {
                        validate: function (implementationProperty, errorArray) {
                            // then
                            errorArray.push(errorMessage);
                        }
                    }
                }),
                implementation = {
                    prop: 42
                };
            
            // when
            bp.signatureMatches(implementation, function (err, result) {
                expect(err[0]).to.equal(errorMessage);
                done();
            });
        });
        
    });
    
    describe('when the sync version of signatureMatches is used', function () {

        it('should behave synchronously, with the same information that is available in the async signatureMatches', function () {
            // given
            var sut = sutSetup(),
                actual,
                obj = {
                    num: 42,
                    str: 'string',
                    arr: [],
                    currency: '42.42',
                    bool: true,
                    obj: {
                        foo: 'bar'
                    },
                    func: function (arg1, arg2) {},
                    dec: 42.42
                };

            // when
            actual = sut.blueprint.syncSignatureMatches(obj);
            
            // then
            expect(actual.result).to.equal(true);
        });

    });

});
