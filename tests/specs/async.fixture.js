(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.run = Spec;
    } else if (window) {
        window.fixtures = window.fixtures || {};
        window.fixtures.async = {
            run: Spec
        };
    } else {
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    function Spec (async, describe, it, xit, expect) {
        describe('async', function () {

            describe('when runAsync is executed', function () {
                it('should execute the callback asynchronously', function (done) {
                    // when
                    async.runAsync(function () {
                        // then
                        done();
                    });
                });
            }); // /runAsync

            describe('when runAsync is executed with the highPriority flag', function () {
                it('should execute the callback asynchronously', function (done) {
                    // when
                    async.runAsync(function () {
                        // then
                        done();
                    }, true);
                });
            }); // /runAsync

            describe('when waterfall is executed', function () {
                it('should execute each task', function (done) {
                    // when
                    async.waterfall([
                        function (callback) { callback(null, 1); },
                        function (num, callback) { callback(null, 2); },
                        function (num, callback) { callback(null, 3); },
                        function (num, callback) { callback(null, 4); },
                        function (num, callback) { callback(null, 5); }
                    ], function (err, results) {
                        expect(err).to.equal(null);
                        expect(results).to.equal(5);
                        done();
                    });
                });

                it('should support diverse arguments', function (done) {
                    // when
                    async.waterfall([
                        function (callback) { callback(null, 1, 2, 3); },
                        function (num1, num2, num3, callback) {
                            expect(num1).to.equal(1);
                            expect(num2).to.equal(2);
                            expect(num3).to.equal(3);
                            callback(null, 2);
                        },
                        function (num2, callback) {
                            expect(num2).to.equal(2);
                            callback(null, 3, 4, 5, 6);
                        },
                        function (num3, num4, num5, num6, callback) {
                            expect(num3).to.equal(3);
                            expect(num4).to.equal(4);
                            expect(num5).to.equal(5);
                            expect(num6).to.equal(6);
                            callback(null, 4);
                        },
                        function (num4, callback) {
                            expect(num4).to.equal(4);
                            callback(null, 5, 6, 7);
                        }
                    ], function (err, num5, num6, num7) {
                        expect(err).to.equal(null);
                        expect(num5).to.equal(5);
                        expect(num6).to.equal(6);
                        expect(num7).to.equal(7);
                        done();
                    });
                });

                it('should should short circuit if an error is presented', function (done) {
                    // when
                    async.waterfall([
                        function (callback) { callback(new Error('test')); },
                        function (callback) {
                            console.log('FAIL: should should short circuit if an error is presented');
                            expect(true).to.equal(false);
                            callback();
                        },
                    ], function (err) {
                        expect(err.message).to.equal('test');
                        done();
                    });
                });

                it('should require an array as the first arg', function (done) {
                    async.waterfall({}, function(err){
                        expect(err.message).to.equal('The first argument to waterfall must be an array of functions');
                        done();
                    });
                });

                it('should work without a callback', function(done){
                    async.waterfall([
                        function(callback){callback();},
                        function(callback){callback(); done();}
                    ]);
                });

                it('should execute the tasks in order', function(done){
                    var order = [];
                    async.waterfall([
                        function (callback) { order.push(1); callback(); },
                        function (callback) { order.push(2); callback(); },
                        function (callback) { order.push(3); callback(); },
                        function (callback) { order.push(4); callback(); },
                        function (callback) { order.push(5); callback(); }
                    ], function () {
                        expect(order).to.eql([1,2,3,4,5]);
                        done();
                    });
                });

                it('should present an error if a callback is executed more than once', function (done) {
                    // when
                    async.waterfall([
                        function (callback) { callback(null, 1); callback(); },
                        function (num, callback) { callback(null, 2); }
                    ], function (err) {
                        expect(err.message).to.equal('Callback was already called.');
                        done();
                    });
                });

                it('should support a blocking option', function() {
                    var actual;

                    async.waterfall(
                        [
                            function (callback) { callback(null, 1); },
                            function (num, callback) { callback(null, num + 1); },
                            function (num, callback) { callback(null, num + 1); },
                            function (num, callback) { callback(null, num + 1); },
                            function (num, callback) { callback(null, num + 1); }
                        ],
                        { blocking: true },
                        function (err, num) {
                            actual = num;
                        }
                    );

                    expect(actual).to.equal(5);
                });

            }); // /waterfall

        }); // /describe async
    } // /Spec

}());
