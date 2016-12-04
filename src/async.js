(function () {
    'use strict';

    var async = Async();

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    } else if (window && window.polyn) {
        window.polyn.addModule('async', null, Async);
    } else {
        console.log(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME or POLYN NOT DEFINED'));
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
