# mako-js

> A plugin for working with JS, using npm as a package manager.

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

## Purpose

 - compiles each entry file recursively via `require(...)` statements into a single output file
   (similar to browserify/webpack)
 - makes JSON files `require`-able
 - allow for creating a shared dependency bundle
 - generates proper source maps (to be written by [mako-sourcemaps][mako-sourcemaps])

## API

### js(options)

Create a new plugin instance, with the following `options` available:

 - `browser` if unset, will disable browser-specific features, resulting in a script that can run in node
 - `bundle` if set, should be a pathname (relative to `root`) that specifies an extra file to put shared dependencies in
 - `checkSyntax` if unset, will disable the syntax check hook
 - `core` adds a list of custom "core modules" to [resolve][resolve]
 - `detectiveOptions` additional options to be passed to [detective][detective]
 - `extensions` additional extensions to resolve with **in addition to** `.js` and `.json` (eg: `.coffee`)
 - `modules` additional modules to be passed to [browser-resolve][browser-resolve]
 - `resolveOptions` additional options to be passed to [resolve][resolve]
 - `sourceMaps` specify `true` to enable source-maps (default: `false`)
 - `sourceRoot` specifies the path used as the source map root (default: `"mako://"`)


[browser-resolve]: https://www.npmjs.com/package/browser-resolve
[coveralls-badge]: https://img.shields.io/coveralls/makojs/js.svg
[coveralls]: https://coveralls.io/github/makojs/js
[david-badge]: https://img.shields.io/david/makojs/js.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/js.svg
[david-dev]: https://david-dm.org/makojs/js#info=devDependencies
[david]: https://david-dm.org/makojs/js
[detective]: https://www.npmjs.com/package/detective
[mako-sourcemaps]: ../sourcemaps
[npm-badge]: https://img.shields.io/npm/v/mako-js.svg
[npm]: https://www.npmjs.com/package/mako-js
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/3127eda3-004e-46f2-b0d5-39e49c675fcf/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/3127eda3-004e-46f2-b0d5-39e49c675fcf
[resolve]: https://www.npmjs.com/package/resolve
