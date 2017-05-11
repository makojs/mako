# mako-write

> A plugin that writes files to disk.

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

## Purpose

 - ensures that `file.path !== file.initialPath` to prevent clobbering
 - writes `file.contents` to disk at the current `file.path` location

## API

### write(extensions, [options])

The `extensions` argument can be passed as either a single `String` or an `Array` of extensions.
(without the leading dot)

The following `options` are available:

 - `force`: bypasses the "initialPath" check (useful when the file only exists in memory)


[coveralls-badge]: https://img.shields.io/coveralls/makojs/write.svg
[coveralls]: https://coveralls.io/github/makojs/write
[david-badge]: https://img.shields.io/david/makojs/write.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/write.svg
[david-dev]: https://david-dm.org/makojs/write#info=devDependencies
[david]: https://david-dm.org/makojs/write
[npm-badge]: https://img.shields.io/npm/v/mako-write.svg
[npm]: https://www.npmjs.com/package/mako-write
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/90c21da3-da6d-41a8-a4c4-8ddd8100af7e/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/90c21da3-da6d-41a8-a4c4-8ddd8100af7e
