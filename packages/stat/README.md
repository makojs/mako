# mako-stat

> A plugin for checking a file's stat.

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

## Purpose

 - a way to fail fast by checking a file's existence before any other plugins
 - populates `file.stat` for later plugins to consume
 - marks a file as dirty when the `mtime` changes between builds

## API

### stat(extensions)

The `extensions` argument can be passed as either a single `String` or an `Array` of extensions.
(without the leading dot)


[coveralls-badge]: https://img.shields.io/coveralls/makojs/stat.svg
[coveralls]: https://coveralls.io/github/makojs/stat
[david-badge]: https://img.shields.io/david/makojs/stat.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/stat.svg
[david-dev]: https://david-dm.org/makojs/stat#info=devDependencies
[david]: https://david-dm.org/makojs/stat
[npm-badge]: https://img.shields.io/npm/v/mako-stat.svg
[npm]: https://www.npmjs.com/package/mako-stat
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/a0fbc730-9c8f-4d4c-9ad0-45918af87a17/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/a0fbc730-9c8f-4d4c-9ad0-45918af87a17
