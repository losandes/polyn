(function () {
    'use strict';

    var errorTypeWarning = '[POLYN] EXCEPTION WARNING: You should always pass an Error to Exception, to preserver your stack trace';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Exception;
    } else if (window) {
        window.polyn = window.polyn || {};
        Object.defineProperty(window.polyn, 'Exception', {
            get: function () {
                return Exception;
            },
            set: function () {
                var err = new Error('polyn modules are read-only');
                console.log(err);
                return err;
            },
            // this property should show up when this object's property names are enumerated
            enumerable: true,
            // this property may not be deleted
            configurable: false
        });
    } else {
        console.log('Unable to define module: UNKNOWN RUNTIME');
    }

    function normalizeType (type) {
        return typeof type === 'string' ? type : 'Exception';
    }

    function normalizeError (type, error) {
        if (typeof type === 'object') {
            return type;
        }

        var err = error;

        if (typeof error === 'string') {
            console.log(errorTypeWarning);
            err = new Error(error);
        } else if (!error) {
            console.log(errorTypeWarning);
            err = new Error('UNKNOWN');
        }

        return err;
    }

    function normalizeMessages (error, messages) {
        var msgs = [];

        if (Array.isArray(messages)) {
            msgs = messages;
        } else if (messages) {
            msgs.push(messages);
        } else if (!messages && error && error.message) {
            msgs.push(error.message);
        }

        return msgs;
    }

    /*
    // Exception
    // Make an exception argument of the given type
    // @param type: The type of exception
    // @param error: An instance of a JS Error
    // @param messages: An array of messages
    */
    function Exception(type, error, messages) {
        var err = normalizeError(type, error);

        return {
            type: normalizeType(type),
            error: err,
            messages: normalizeMessages(err, messages),
            isException: true
        };
    } // /ExceptionOfType

}());
