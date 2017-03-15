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
            runAsync: runAsync,
            waterfall: waterfall
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

        function waterfall (tasks, options, callback) {
            var idx = -1;

            if (typeof options === 'function') {
                callback = once(options || noop);
                options = { blocking: false };
            } else {
                callback = once(callback || noop);
                options = options || {};
            }

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
                optionalAsync(function () {
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

            function optionalAsync (func) {
                if (options.blocking) {
                    func();
                } else {
                    runAsync(func, true);
                }
            }
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
