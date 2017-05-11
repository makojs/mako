# mako-cache

> A helper for reading/writing build caches.

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

This helper encapsulates the logic for loading and saving mako build cache files.


## Usage

```js
var cache = require('mako-cache');

// read a build tree from disk
cache.load().then(function (tree) {
  // tree can be passed to a mako runner
});

// save a build tree to disk
cache.save(tree).then(function () {
  // multiple writes will be queued, so they don't clobber one another
});
```


## API

This API returns promises, except in the case of the documented sync functions.

### cache.load(root)

Using the given project `root`, a cache file will be looked for in the mako
cache folder. (in the OS temp directory) If found, it will be unserialized
and returned as a `Tree` instance that can be given to a mako runner.

If no `root` is specified, it will assume you meant pwd.

If the given `file` does not exist, it will simply return `null` rather than
throwing an error.

### cache.loadSync(root)

The same as `cache.load(root)`, except it is **synchronous**.

### cache.save(tree)

Saves the given `tree` to the mako cache folder. (in the OS temp directory) The
contents of file are a gzipped JSON representation of the tree.

### cache.saveSync(tree)

The same as `cache.save(tree)`, except it is **synchronous**.

### cache.clear([root])

Used to clear out the mako cache folder. If a `root` is specified, only that
project's cache file will be deleted. If no `root` is specified, the entire
folder will be deleted.

### cache.clearSync([root])

The same as `cache.clear([root])`, except it is **synchronous**.

### cache.path(root)

Returns the calculated path to the file that the project `root` would have.


[coveralls-badge]: https://img.shields.io/coveralls/makojs/cache.svg
[coveralls]: https://coveralls.io/github/makojs/cache
[david-badge]: https://img.shields.io/david/makojs/cache.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/cache.svg
[david-dev]: https://david-dm.org/makojs/cache#info=devDependencies
[david]: https://david-dm.org/makojs/cache
[mako-tree]: ../tree
[npm-badge]: https://img.shields.io/npm/v/mako-cache.svg
[npm]: https://www.npmjs.com/package/mako-cache
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/6c7dd5b7-0aa7-4a2b-999b-65cfcb03b42e/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/6c7dd5b7-0aa7-4a2b-999b-65cfcb03b42e
