/*jslint bitwise:true*/
(function () {
    'use strict';

    var id = Id();

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = id;
    } else if (window) {
        window.polyn = window.polyn || {};
        Object.defineProperty(window.polyn, 'id', {
            get: function () {
                return id;
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
    // id
    */
    function Id () {
        var id = {
                createUid: undefined,
                createGuid: undefined
            },
            createRandomString;

        createRandomString = function (templateString) {
            return templateString.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : r & 3 | 8;
                return v.toString(16);
            });
        };

        id.createUid = function (length) {
            var template;

            length = length || 12;
            template = new Array(length + 1).join('x');

            return createRandomString(template);
        };

        id.createGuid = function () {
            return createRandomString('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
        };

        return id;
    }

}());
