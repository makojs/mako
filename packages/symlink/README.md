# mako-symlink

> A plugin that symlinks files to the output path.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Purpose

 - symlinks files that are not being operated on in-memory (from `file.initialPath` to `file.path`)

## API

### symlink(extensions)

The `extensions` argument can be passed as either a single `String` or an `Array` of extensions.
(without the leading dot)


[david-badge]: https://img.shields.io/david/makojs/symlink.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/symlink.svg
[david-dev]: https://david-dm.org/makojs/symlink#info=devDependencies
[david]: https://david-dm.org/makojs/symlink
[npm-badge]: https://img.shields.io/npm/v/mako-symlink.svg
[npm]: https://www.npmjs.com/package/mako-symlink
