(function () {
    'use strict';

    var async = Async();

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    } else if (window) {
        window.polyn = window.polyn || {};
        Object.defineProperty(window.polyn, 'async', {
            get: function () {
                return async;
            },
            set: function () {
                var err = new Error('[POLYN] polyn modules are read-only');
                console.log(err);
                return err;
            },
            // this property should show up when this object's property names are enumerated
            enumerable: true,
            // this property may not be deleted
            configurable: false
        });
    } else {
        console.log('[POLYN] Unable to define module: UNKNOWN RUNTIME');
    }

    /*
    // async
    */
    function Async () {
        var async = {
            runAsync: undefined
        };

        async.runAsync = function (func, highPriority) {
            if (
                highPriority === true &&
                typeof process !== 'undefined' &&
                typeof process.nextTick === 'function'
            ) {
                process.nextTick(func);
            } else {
                setTimeout(func, 0);
            }
        };

        return async;
    }

}());
