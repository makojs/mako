# mako-watch

> A mako util for watching a build root for changes.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Purpose

This plugin takes a mako [tree][mako-tree], and sets up a watch (using
[chokidar][chokidar]) against the configured root. The watcher itself is an
`Emitter` with events for responding to changes in the dependency tree.


## API

### Watcher(tree, options)

Creates a new watcher for the given mako `tree`. The input `options` will be
passed directly to chokidar.

### Events

 - `ready()` after the initial scan is complete
 - `change(file, tree)` when a file has been modified
 - `error(err)` when an error has been triggered

### Watcher#unwatch()

Shuts down the chokidar watcher.


[chokidar]: https://www.npmjs.com/package/chokidar
[david-badge]: https://img.shields.io/david/makojs/watch.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/watch.svg
[david-dev]: https://david-dm.org/makojs/watch#info=devDependencies
[david]: https://david-dm.org/makojs/watch
[mako-tree]: ../tree
[npm-badge]: https://img.shields.io/npm/v/mako-watch.svg
[npm]: https://www.npmjs.com/package/mako-watch
