module.exports.name = 'foo';
module.exports.dependencies = [];
module.exports.factory = function () {
    'use strict';

    return {
        num: 42,
        str: 'string',
        arr: [],
        currency: '42.42',
        bool: true,
        date: new Date(),
        regex: /[A-B]/,
        obj: {
            foo: 'bar'
        },
        func: function (arg1, arg2) {
            console.log(arg1, arg2);
        },
        dec: 42.42
    };

};
