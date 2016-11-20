(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.run = Spec;
    } else if (window) {
        window.fixtures = window.fixtures || {};
        window.fixtures.id = {
            run: Spec
        };
    } else {
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    function Spec (id, describe, it, expect) {
        describe('id, ', function () {

            describe('when createUid is executed without any arguments', function () {

                it('should return a random string of 12 characters', function () {
                    // given
                    var actual;

                    // when
                    actual = id.createUid();

                    // then
                    expect(typeof actual).to.equal('string');
                    expect(actual.length).to.equal(12);

                });

            });

            describe('when createUid is executed with a uid size', function () {

                it('should return a random string of the number characters that were passed in', function () {
                    // given
                    var length = 8,
                        actual;

                    // when
                    actual = id.createUid(length);

                    // then
                    expect(typeof actual).to.equal('string');
                    expect(actual.length).to.equal(length);

                });

            });

            describe('when createGuid is executed', function () {

                it('should return a 36 characer Guid', function () {
                    // given
                    var actual;

                    // when
                    actual = id.createGuid();

                    // then
                    expect(typeof actual).to.equal('string');
                    expect(actual.length).to.equal(36);

                });

            });

        });
    }

}());
