(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.run = Spec;
    } else if (window) {
        window.fixtures = window.fixtures || {};
        window.fixtures.Exception = {
            run: Spec
        };
    } else {
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    function Spec (Exception, describe, it, expect) {
        describe('Exception', function () {

            // squash the console ouput
            Exception.configure({
                onWarning: function () { /*swallow*/ }
            });

            describe('when an Exception is created', function () {
                it('should expose the first argument as the `type`', function () {
                    // given
                    var type = 'TestException';

                    // when
                    var actual = new Exception(type, new Error('Test'));

                    // then
                    expect(actual.type).to.equal(type);
                });

                it('should expose the boolean, `isException`', function () {
                    // when
                    var actual = new Exception('TestException', new Error('Test'));

                    // then
                    expect(actual.isException).to.equal(true);
                });

                it('should support an overload with the first arg being the Error', function () {
                    // given
                    var err = new Error('test');

                    // when
                    var actual = new Exception(err);

                    // then
                    expect(actual.type).to.equal('Exception');
                    expect(actual.isException).to.equal(true);
                    expect(actual.error.message).to.equal(err.message);
                });
            });

            describe('when an Exception is created with an Error object', function () {
                it('should expose the error', function () {
                    // given
                    var err = new Error('test');

                    // when
                    var actual = new Exception('TestException', err);

                    // then
                    expect(actual.error.message).to.equal(err.message);
                });
            });

            describe('when an Exception is created with a string for the error', function () {
                it('should create an error, using the string as the message', function () {
                    // given
                    var err = 'test';

                    // when
                    var actual = new Exception('TestException', err);

                    // then
                    expect(actual.error.message).to.equal(err);
                });
            });

            describe('when an Exception is created with a null error arg', function () {
                it('should generate an empty error with an UNKNOWN message', function () {
                    // when
                    var actual = new Exception('TestException', null);
                    var actual2 = new Exception('TestException');

                    // then
                    expect(actual.error.message).to.equal('UNKNOWN');
                    expect(actual2.error.message).to.equal('UNKNOWN');
                });
            });

            describe('when an Exception is created with an array of messages', function () {
                it('should expose the messages as an array', function () {
                    // given
                    var messages = [
                        'message1',
                        'message2'
                    ];

                    // when
                    var actual = new Exception('TestException', new Error('Test'), messages);

                    // then
                    expect(actual.messages[0]).to.equal(messages[0]);
                    expect(actual.messages[1]).to.equal(messages[1]);
                });
            });

            describe('when an Exception is created with single string message', function () {
                it('should expose the messages as an array', function () {
                    // given
                    var message = 'message1';

                    // when
                    var actual = new Exception('TestException', new Error('Test'), message);

                    // then
                    expect(actual.messages[0]).to.equal(message);
                });
            });

            describe('when an Exception is created with no messages', function () {
                it('should expose the messages as an array, using the error.message', function () {
                    // given
                    var errMessage = 'message1';

                    // when
                    var actual = new Exception('TestException', new Error(errMessage));

                    // then
                    expect(actual.messages[0]).to.equal(errMessage);
                });
            });

            describe('when an Exception is created with no messages, and the error is not of type Error', function () {
                it('should expose an empty messages array', function () {
                    // when
                    var actual = new Exception('TestException', {});

                    // then
                    expect(actual.messages.length).to.equal(0);
                });
            });

        }); // /describe async
    } // /Spec

}());
