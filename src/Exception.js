(function () {
    'use strict';

    var errorTypeWarning = '[POLYN] EXCEPTION WARNING: You should always pass an Error to Exception, to preserve your stack trace',
        config = {
            onWarning: function (message) {
                console.log(message);
            }
        };

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Exception;
    } else if (window && window.polyn) {
        window.polyn.addModule('Exception', null, function () { return Exception; });
    } else {
        console.log(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME or POLYN NOT DEFINED'));
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
            config.onWarning(errorTypeWarning);
            err = new Error(error);
        } else if (!error) {
            config.onWarning(errorTypeWarning);
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

    Exception.configure = function (cfg) {
        cfg = cfg || {};

        if (typeof cfg.onWarning === 'function') {
            config.onWarning = cfg.onWarning;
        }
    };

}());
