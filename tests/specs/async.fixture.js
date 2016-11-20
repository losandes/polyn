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

    function Spec (async, describe, it) {
        describe('async', function () {

            describe('when runAsync is executed', function () {
                it('should execute the callback asynchronously', function (done) {
                    // when
                    async.runAsync(function () {
                        // then
                        done();
                    });
                });
            });

            describe('when runAsync is executed with the highPriority flag', function () {
                it('should execute the callback asynchronously', function (done) {
                    // when
                    async.runAsync(function () {
                        // then
                        done();
                    }, true);
                });
            });

        }); // /describe async
    } // /Spec

}());
