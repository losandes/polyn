/*jslint bitwise:true*/
(function () {
    'use strict';

    /*
    // Exports
    */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = new Id();
    } else if (window && window.polyn) {
        window.polyn.addModule('id', null, Id);
    } else {
        console.log(new Error('[POLYN] Unable to define module: UNKNOWN RUNTIME or POLYN NOT DEFINED'));
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
