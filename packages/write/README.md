# mako-write

> A plugin that writes files to disk.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Purpose

 - ensures that `file.path !== file.initialPath` to prevent clobbering
 - writes `file.contents` to disk at the current `file.path` location

## API

### write(extensions, [options])

The `extensions` argument can be passed as either a single `String` or an `Array` of extensions.
(without the leading dot)

The following `options` are available:

 - `force`: bypasses the "initialPath" check (useful when the file only exists in memory)


[david-badge]: https://img.shields.io/david/makojs/write.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/write.svg
[david-dev]: https://david-dm.org/makojs/write#info=devDependencies
[david]: https://david-dm.org/makojs/write
[npm-badge]: https://img.shields.io/npm/v/mako-write.svg
[npm]: https://www.npmjs.com/package/mako-write
