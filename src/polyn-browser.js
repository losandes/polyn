(function () {
    'use strict';

    var warn = function (err) {
        var log = console.warn || console.log;
        log(err.message, err);
        return err;
    };

    if (!window) {
        return warn(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME'));
    }

    window.polyn = window.polyn || {}
    window.polyn.addModule = function addModule(name, dependencies, Factory) {
        var i, singleton;

        if (Array.isArray(dependencies)) {
            for (i = 0; i < dependencies.length; i += 1) {
                if (!polyn[dependencies[i]]) {
                    return warn(new Error('[POLYN] Unable to define module: LOADED OUT OF ORDER'));
                }
            }
        }

        singleton = new Factory(polyn);

        Object.defineProperty(polyn, name, {
            get: function () {
                return singleton;
            },
            set: function () {
                return warn(new Error('[POLYN] polyn modules are read-only'));
            },
            // this property should show up when this object's property names are enumerated
            enumerable: true,
            // this property may not be deleted
            configurable: false
        });
    }
}());
