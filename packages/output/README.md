# mako-output

> A plugin that generates the output location for files.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Purpose

 - rewrites `file.path` to be in a subdirectory relative to `file.base` (eg: `index.js -> build/index.js`)

## API

### output(extensions, [options])

The `extensions` argument can be passed as either a single `String` or an `Array` of file extensions.
(without the leading dot)

Available `options`:
 - `dir` (default: `build`)


[david-badge]: https://img.shields.io/david/makojs/output.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/output.svg
[david-dev]: https://david-dm.org/makojs/output#info=devDependencies
[david]: https://david-dm.org/makojs/output
[npm-badge]: https://img.shields.io/npm/v/mako-output.svg
[npm]: https://www.npmjs.com/package/mako-output
