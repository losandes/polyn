(function () {
    'use strict';

    var locale = {
        errorTypes: {
            INVALID_ARGUMENT_EXCEPTION: 'InvalidArgumentException',
            INNER_TASK_ERR: 'InnerTaskError',
            CAUGHT_TASK_ERR: 'CaughtTaskError'
        }
    };

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = new Async(
            require('./Exception.js')
        );
    } else if (window && window.polyn) {
        window.polyn.addModule('async', ['Exception'], Factory);
    } else {
        console.log(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME or POLYN NOT DEFINED'));
    }

    function Factory(polyn) {
        return new Async(
            polyn.Exception
        );
    }

    /*
    // async
    */
    function Async (Exception) {
        var async = {
            runAsync: runAsync,
            waterfall: waterfall,
            syncWaterfall: syncWaterfall
        };

        //////////////////////////////////

        function runAsync (func, highPriority) {
            if (
                highPriority === true &&
                typeof process !== 'undefined' &&
                typeof process.nextTick === 'function'
            ) {
                process.nextTick(func);
            } else {
                setTimeout(func, 0);
            }
        }

        function waterfall (tasks, callback) {
            var idx = -1;
            callback = once(callback || noop);

            if (!Array.isArray(tasks)) {
                return callback(new Error('The first argument to waterfall must be an array of functions'));
            }

            if (!tasks.length) {
                return callback();
            }

            nextTask();

            function nextTask () {
                runAsyncTask(idx += 1, arguments);
            }

            function runAsyncTask (idx, originalArgs) {
                runAsync(function () {
                    try {
                        var err = originalArgs[0],
                            args = makeArgArray(originalArgs);

                        if (err) {
                            return callback.apply(null, [err].concat(args));
                        } else if (idx === tasks.length) {
                            return callback.apply(null, [null].concat(args));
                        }

                        args.push(onlyOnce(nextTask));
                        tasks[idx].apply(null, args);
                    } catch (e) {
                        return callback.apply(null, [e]);
                    }
                }, true);
            }
        }

        function syncWaterfall (tasks) {
            var idx = -1, finalValue;

            if (!Array.isArray(tasks) || !tasks.length) {
                return new Exception(
                    locale.errorTypes.INVALID_ARGUMENT_EXCEPTION,
                    new Error('The first argument to waterfall must be an array of functions')
                );
            }

            nextTask();

            function nextTask () {
                executeTask(idx += 1, arguments);
            }

            function executeTask (idx, originalArgs) {
                try {
                    var err = originalArgs[0],
                        args = makeArgArray(originalArgs);

                    if (err) {
                        finalValue = new Exception(
                            locale.errorTypes.INNER_TASK_ERR,
                            err
                        );

                        return;
                    } else {
                        finalValue = args && args.length === 1 ? args [0] : args;
                    }

                    if (typeof tasks[idx] === 'function') {
                        args.push(onlyOnce(nextTask));
                        tasks[idx].apply(null, args);
                    }
                } catch (e) {
                    finalValue = new Exception(
                        locale.errorTypes.CAUGHT_TASK_ERR,
                        e
                    );
                }
            }

            return finalValue;
        }

        return async;
    } // /Async

    ///////////////////////////////////////

    function once (func) {
        return function () {
            if (func === null) {
                return;
            }

            var callFn = func;
            func = null;
            callFn.apply(this, arguments);
        };
    }

    function onlyOnce (func) {
        return function() {
            if (func === null) {
                throw new Error('Callback was already called.');
            }

            var callFn = func;
            func = null;
            callFn.apply(this, arguments);
        };
    }

    function noop () {
        // no operation performed
    }

    /*
    // Converts arguments into an array, and removes the first item (the err position)
    */
    function makeArgArray (args) {
        var prop, arr = [];

        for (prop in args) {
            if (args.hasOwnProperty(prop)) {
                arr.push(args[prop]);
            }
        }

        arr.shift();

        return arr;
    }

}());
