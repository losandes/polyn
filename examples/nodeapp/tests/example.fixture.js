/*jslint node: true*/
/*globals describe, it*/
"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

// We use mocha (http://mochajs.org/) as our test framework
// and chai (http://chaijs.com/api/bdd/) as our assertion library.
describe('Array', function () {

    describe('indexOf', function () {
        
        it('should return -1 when the value is not present', function () {
            // given
            var array = [1, 2, 3],
                actual,
                expected = -1;
            
            // when
            actual = array.indexOf(5);
            
            // then (using expect syntax)
            expect(actual).to.equal(expected);
            
            // then (using should syntax)
            actual.should.equal(expected);
        });
        
        it('should return an integer when the value is present', function () {
            // given
            var array = [1, 2, 3],
                actual,
                expected = 2;
            
            // when
            actual = array.indexOf(3);
            
            // then (using expect syntax)
            expect(actual).to.equal(expected);
            
            // then (using should syntax)
            actual.should.equal(expected);
        });
        
    });
    
    // Async example => use done to indicate that the test is complete
    describe('setTimeout', function () {
        it('should execute the callback after waiting the prescribed amount of time', function (done) {
            // given
            var actual,
                expected = true;
            
            // when
            setTimeout(function () {
                actual = true;
                
                // then
                expect(actual).to.equal(expected);
                
                done();
            }, 0);
        });
    });
    
});
