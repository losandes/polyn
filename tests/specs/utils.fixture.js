/*jshint mocha: true*/
/*globals describe, it*/
'use strict';

var expect = require('chai').expect,
    is = require('../../src/is.js').factory(),
    utils = require('../../src/utils.js').factory(is);

describe('utils, ', function () {

    describe('when runAsync is executed', function () {

        it('should execute the callback asynchronously', function (done) {
            // given

            // when
            utils.runAsync(function () {
                // then
                expect(true).to.equal(true);
                done();
            });

        });

    });

    describe('when runAsync is executed with the highPriority flag', function () {

        it('should execute the callback asynchronously', function (done) {
            // given

            // when
            utils.runAsync(function () {
                // then
                expect(true).to.equal(true);
                done();
            }, true);

        });

    });

});
