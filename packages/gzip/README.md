# mako-gzip

> A plugin for compressing files using gzip.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Purpose

 - compresses files using node's `zlib.gzip` into a new file
 - the new file is the same path as the input, only given a `.gz` suffix (eg: `index.js -> index.js.gz`)

## API

### gzip(extensions)

The list of file extensions to apply this plugin for.


[david-badge]: https://img.shields.io/david/makojs/gzip.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/gzip.svg
[david-dev]: https://david-dm.org/makojs/gzip#info=devDependencies
[david]: https://david-dm.org/makojs/gzip
[npm-badge]: https://img.shields.io/npm/v/mako-gzip.svg
[npm]: https://www.npmjs.com/package/mako-gzip
