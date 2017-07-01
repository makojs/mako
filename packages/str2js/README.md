# mako-str2js

> A plugin that for converting text files to a require-able JS string.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Purpose

 - enables text files to be `require`'d as strings (via [mako-js][mako-js])

## API

### str2js(extensions)

The `extensions` argument can be passed as either a single `String` or an `Array` of extensions.
(without the leading dot)

The default list of `extensions` is:
 - `txt`
 - `html`


[david-badge]: https://img.shields.io/david/makojs/str2js.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/str2js.svg
[david-dev]: https://david-dm.org/makojs/str2js#info=devDependencies
[david]: https://david-dm.org/makojs/str2js
[mako-js]: ../js
[npm-badge]: https://img.shields.io/npm/v/mako-str2js.svg
[npm]: https://www.npmjs.com/package/mako-str2js
