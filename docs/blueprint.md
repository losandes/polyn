Blueprint
==========

Blueprint is a tool to support control of polymorphism in JavaScript. It's kind of like an interface in a strongly typed language like C# or Java. Creating a Blueprint is simple. The following example demonstrates all of the types that are supported in Blueprint.

```JavaScript
var IFoo = new Blueprint({
    num: 'number',
    str: 'string',
    arr: 'array',
    currency: 'money',
    bool: 'bool',
    date: 'datetime',
    regex: 'regexp',
    obj: 'object',
    func: {
        type: 'function',
        args: ['arg1', 'arg2']
    },
    dec: {
        type: 'decimal',
        places: 2
    }
});
```

With the Blueprint above, we can check to see if a given object's signature matches the blueprint:

```JavaScript
var foo = {
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
    func: function (arg1, arg2) {},
    dec: 42.42
};

IFoo.signatureMatches(foo, function (err, result) {
    if (err) {
        throw new Error('foo does not implement IFoo!');
    }
    
    // do something with foo
});
```
