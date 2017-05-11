# mako-symlink

> A plugin that symlinks files to the output path.

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

## Purpose

 - symlinks files that are not being operated on in-memory (from `file.initialPath` to `file.path`)

## API

### symlink(extensions)

The `extensions` argument can be passed as either a single `String` or an `Array` of extensions.
(without the leading dot)


[coveralls-badge]: https://img.shields.io/coveralls/makojs/symlink.svg
[coveralls]: https://coveralls.io/github/makojs/symlink
[david-badge]: https://img.shields.io/david/makojs/symlink.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/symlink.svg
[david-dev]: https://david-dm.org/makojs/symlink#info=devDependencies
[david]: https://david-dm.org/makojs/symlink
[npm-badge]: https://img.shields.io/npm/v/mako-symlink.svg
[npm]: https://www.npmjs.com/package/mako-symlink
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/118e8fb8-dbc8-4bf6-ae01-80b83bf8804c/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/118e8fb8-dbc8-4bf6-ae01-80b83bf8804c
