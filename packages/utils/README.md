# mako-utils

> Internal utilities for mako and plugins.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## API

These utilities are used by mako core and plugins internally, but they may be
useful to other plugin developers.

### relative(to)

Takes the given `to` absolute path and gives the relative path from pwd.

**NOTE:** pwd is cached from startup, so this assumes that cwd never changes.

### size(input, [raw])

Takes the given `input` (string/buffer) and returns the actual size in a
human-friendly format.

The `raw` argument can be passed to return the size in a raw `Number` reflecting
the number of bytes.

### sizeDiff(a, b)

Takes the given numbers for `a` and `b`, computes the delta from `a -> b` and
returns a human-friendly string showing the change.

For example:

```js
console.log(sizeDiff(1000, 1500))
// 1 kB → 1.5 kB (+50%)

console.log(sizeDiff(1000, 250))
// 1 kB → 250 B (-75%)
```

### timer()

Used for timing code with `process.hrtime()`. A function is returned that will
return the time elapsed since the timer was created. (in a human-friendly
format)

```js
let timer = utils.timer()

// do stuff...

console.log('finished doing stuff (took %s)', timer())
```

The returned function has an optional `raw` argument. When set to `true`, it
will instead return the time elapsed in the raw hrtime array format.


[david-badge]: https://img.shields.io/david/makojs/utils.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/utils.svg
[david-dev]: https://david-dm.org/makojs/utils#info=devDependencies
[david]: https://david-dm.org/makojs/utils
[npm-badge]: https://img.shields.io/npm/v/mako-utils.svg
[npm]: https://www.npmjs.com/package/mako-utils
