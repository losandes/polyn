//        var self = {
//                makeException: undefined,
//                makeArgumentException: undefined,
//                makeNotImplementedException: undefined,
//                throwException: undefined
//            };

/*jshint mocha: true*/
/*globals describe, it*/
'use strict';

var expect = require('chai').expect,
    is = require('../../src/is.js').factory(),
    exceptions = require('../../src/exceptions.js').factory(is)(),
    exceptionsWithHandler = require('../../src/exceptions.js').factory(is)(function () {});

describe('exceptions, ', function () {

    describe('when makeExceptions is executed', function () {

        it('should return an Error object', function () {
            // given
            var actual;

            // when
            actual = exceptions.makeException('error', 'it broke', { foo: 'bar' });
            
            // then
            expect(actual instanceof Error).to.equal(true);
        });
        
        it('should return an Error object that has name, message and data properties', function () {
            // given
            var name = 'error',
                message = 'it broke',
                actual;

            // when
            actual = exceptions.makeException(name, message, { foo: 'bar' });
            
            // then
            expect(is.string(actual.name)).to.equal(true);
            expect(actual.name).to.equal(name);
            expect(is.string(actual.message)).to.equal(true);
            expect(actual.message).to.equal(message);
            expect(is.object(actual.data)).to.equal(true);
            expect(is.string(actual.data.foo)).to.equal(true);
        });

    });
    
    describe('when makeArgumentException is executed', function () {

        it('should return an Error object with the name, ArgumentException', function () {
            // given
            var actual;

            // when
            actual = exceptions.makeArgumentException('argument is required', 'foo', { foo: 'bar' });
            
            // then
            expect(actual.name).to.equal('ArgumentException');
        });

    });
    
    describe('when makeNotImplementedException is executed', function () {

        it('should return an Error object with the name, NotImplementedException', function () {
            // given
            var actual;

            // when
            actual = exceptions.makeNotImplementedException('IFoo must be implemented', { foo: 'bar' });
            
            // then
            expect(actual.name).to.equal('NotImplementedException');
        });

    });
    
    describe('when throwException is executed on an exceptions object that was not passed an exceptionHandler', function () {

        it('should throw', function () {
            // given
            var shouldThrow,
                actual;

            // when
            shouldThrow = function () {
                exceptions.throwException(exceptions.makeException('foo', 'bar'));
            };
            
            // then
            expect(shouldThrow).to.throw();
        });

    });
    
    describe('when throwException is executed on an exceptions object that was passed an exceptionHandler that doesn\'t throw', function () {

        it('should NOT throw', function () {
            // given
            var shouldThrow,
                actual;

            // when
            shouldThrow = function () {
                exceptionsWithHandler.throwException(exceptionsWithHandler.makeException('foo', 'bar'));
            };
            
            // then
            expect(shouldThrow).to.not.throw();
        });

    });

});
