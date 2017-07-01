# mako-copy

> A plugin for copying files to the output location.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

# Purpose

 - copies each file from `file.initialPath` to `file.path`

## API

### copy(extensions, [options])

The `extensions` argument can be passed as either a single `String` or an
`Array` of file extensions. (without the leading dot)

Available `options`: - `force` when set, always copy (even if the destination
already exists, and the `mtime` is identical)


[david-badge]: https://img.shields.io/david/makojs/copy.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/copy.svg
[david-dev]: https://david-dm.org/makojs/copy#info=devDependencies
[david]: https://david-dm.org/makojs/copy
[npm-badge]: https://img.shields.io/npm/v/mako-copy.svg
[npm]: https://www.npmjs.com/package/mako-copy
