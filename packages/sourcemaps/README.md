# mako-sourcemaps

> A plugin for working with source maps.

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

## Purpose

 - converts `file.sourceMap` to either an inline comment or an external file (as `file.path + '.map'`)
 - allows prior plugins to only care about the raw `file.sourceMap` object

## API

### sourcemaps(extensions, options)

Create a new plugin instance, with the following `options` available:

 - `inline` set this as `true` to output inline source maps
 - `spaces` set this to a number to pretty-print the map JSON with spaces

**NOTE:** by including this plugin, source maps are assumed to be on. (unlike other plugins, which
use the `true/false/'inline'` paradigm) If you don't want source maps enabled, exclude this plugin.


[coveralls-badge]: https://img.shields.io/coveralls/makojs/sourcemaps.svg
[coveralls]: https://coveralls.io/github/makojs/sourcemaps
[david-badge]: https://img.shields.io/david/makojs/sourcemaps.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/sourcemaps.svg
[david-dev]: https://david-dm.org/makojs/sourcemaps#info=devDependencies
[david]: https://david-dm.org/makojs/sourcemaps
[npm-badge]: https://img.shields.io/npm/v/mako-sourcemaps.svg
[npm]: https://www.npmjs.com/package/mako-sourcemaps
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/49038942-4e93-441a-901d-e594a8d21d42/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/49038942-4e93-441a-901d-e594a8d21d42
