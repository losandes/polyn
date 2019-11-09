# polyn (DEPRECATED)

> This package is deprecated. It has been refactored into new libraries, which you should use instead: [@polyn/blueprint](https://github.com/losandes/polyn-blueprint), and [@polyn/immutable](https://github.com/losandes/polyn-immutable)

polyn is a collection of Node and browser compatible JavaScript utilities that focus on polymorphism.

## Usage

### Node
Immutable is part of the polyn package. To install it:

```
npm install --save polyn
```

Then you can require it like so:

```JavaScript
var polyn = require('polyn');
```

### Browser
Immutable is part of the polyn package. To install it, download the `release` folder, or:

```
bower install --save polyn
```

Then add a script tag:

```html
<script src="polyn.min.js"></script>
```

Then it will be available on the window:

```JavaScript
window.polyn;
```

## Blueprint
Blueprint is a validation tool. It can be use to:

* Validate or require properties
* Validate or require arguments

Read more about [Blueprints on the wiki](https://github.com/losandes/polyn/wiki/Blueprint).

## Immutable
Immutable allows us to generate constructors that validate schema's, using Blueprint, and to render immutable objects.

> im•mu•ta•ble (ĭ-myo͞oˈtə-bəl), adj.
> Not subject or susceptible to change.

Read more about [Immutables on the wiki](https://github.com/losandes/polyn/wiki/Immutable).
