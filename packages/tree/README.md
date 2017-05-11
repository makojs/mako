# mako-tree

> The build tree structure used internally by mako

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]


## API

The `Tree` constructor (documented below) is the primary export for the module. It must be used
with the `new` keyword.

```js
var Tree = require('mako-tree');
var tree = new Tree();
```

### Tree([root]) *(constructor)*

Each instance represents a build tree. Internally, a graph is used to manage the relationships
between all the files being tracked.

The `root` is a project root that will determine all `file.base` properties. Only 1 root is
supported per tree. Also, this value will override any `base` parameter you specify in when
adding files.

### Tree[@@iterable]()

This class implements the `Iterable` interface, which iterates the files in the tree in topological
order. (see `Tree#getFiles()` for more information)

```js
for (const file of tree) {
  // iterate files in topological order
}
```

This sugar allows you to treat the tree itself as an iterable, which can be useful in interacting
with other APIs.

### Tree#hasFile(file)

Returns a `Boolean` reflecting if the given `file` exists in the tree.

### Tree#addFile(params)

Creates a file with the given `params` and adds it to the tree.

### Tree#getFile(file)

Returns the `File` instance for the given `file` ID.

### Tree#findFile(path)

Searches the tree for a file that has the given `path`. (either currently, or at any point in
it's history) If none is found, it simply returns `undefined`.

### Tree#getFiles([options])

Returns an `Array` of all the `File` objects in this graph.

If `options.topological` is set, the returned list will be in
[topological order](https://en.wikipedia.org/wiki/Topological_sorting), which respects all
dependencies so processing is safe where order matters.

### Tree#removeFile(file, [options])

Removes the given `file` from the tree. It will throw an exception if that file has any current
dependency links.

If `options.force` is set, it will forcefully remove the file, as well as any remaining links.

### Tree#hasDependency(parent, child, [options])

Returns a `Boolean` reflecting if the dependency relationship between `parent` and `child` already
exists in the tree.

If `options.recursive` is `true`, it will check the dependency tree recursively.

### Tree#addDependency(parent, child)

Adds a new dependency relationship to the graph setting `parent` as depending on `child`.

If either `parent` or `child` are not already in the graph, it will throw.

### Tree#removeDependency(parent, child)

Removes the dependency link between `parent` and `child`.

If this link does not already exist, this will throw.

### Tree#dependenciesOf(file, [options])

Returns an `Array` of files that are direct dependencies of the given `file`.

If `options.recursive` is set, it will return all the files **down** the entire dependency chain.

### Tree#hasDependant(child, parent, [options])

Returns a `Boolean` reflecting if the dependency relationship between `child` and `parent` already
exists in the tree.

If `options.recursive` is `true`, it will check the dependency tree recursively.

### Tree#addDependant(child, parent)

Adds a new dependency relationship to the graph setting `child` as depended on by `parent`.

If either `parent` or `child` are not already in the graph, it will throw.

### Tree#removeDependant(child, parent)

Removes the dependency link between `parent` and `child`.

If this link does not already exist, this will throw.


### Tree#dependantsOf(file, [options])

Returns an `Array` of files that directly depend on the given `file`.

If `options.recursive` is set, it will return all the files **up** the entire dependency chain.

### Tree#size()

Returns the number of files in the tree.

### Tree#clone()

Returns a new `Tree` object that is an effective clone of the original.

### Tree#prune([anchors])

Removes any files from the graph that are unaccessible by any of the provided `anchors` files.

### Tree#removeCycles()

Removes any cycles found in the tree. This is only a last-ditch effort before attempting
topological sorting, so it makes no guarantees about where it breaks cycles. (circular dependencies
should work, but that doesn't change the fact that they should be avoided if possible)

### Tree#toJSON()

Returns a trimmed object that can be serialized as JSON. (it should be possible to reconstruct the
tree from the output)

### Tree#toString([space])

Serializes the tree into a JSON string, which can be written to disk (and then read back) to help
reduce the amount of duplicate work between different runs of mako.

The `space` parameter is there if you want to "pretty-print" the JSON output.

### Tree.fromString(input)

Unserializes a JSON string into a `Tree` instance. (see `Tree#toJSON()`)


### File(params, tree) *(constructor)*

This file class extends [vinyl](https://www.npmjs.com/package/vinyl). The `params` will be passed
directly to that constructor. (except where `params` is a string, then it will be passed as
`{ path: params }`)

### File#type

A getter/setter for the extension name. (without a leading `.`)

### File#initialPath

A getter that retrieves the original path for this file.

### File#initialType

A getter that retrieves the original type for this file. (without a leading `.`)

### File#contents

A `Buffer` containing the contents for this file.

**NOTE:** using strings is no longer supported for this property as Vinyl only supports `Buffer`
and `Stream` values.

### File#hasDependency(child)

Short-hand for `tree.hasDependency(file.path, child)`.

### File#addDependency(child)

Short-hand for `tree.addDependency(file.path, child)`.

### File#removeDependency(child)

Short-hand for `tree.removeDependency(file.path, child)`.

### File#dependencies([options])

Short-hand for `tree.dependenciesOf(file.path, options)`.

### File#hasDependant(parent)

Short-hand for `tree.hasDependant(file.path, parent)`.

### File#addDependant(parent)

Short-hand for `tree.addDependency(file.path, parent)`.

### File#removeDependant(parent)

Short-hand for `tree.removeDependant(file.path, parent)`.

### File#dependants([options])

Short-hand for `tree.dependantsOf(file.path, options)`.

### File#reset()

Used by mako to reset a file enough that it can be safely processed again.

### File#clone()

Creates a clone of this file, such as when cloning the parent `Tree`.

### File#copy(newPath, [options])

Copies this file to a `newPath` (relative to current path) with a new ID that
can be added to a `Tree` as a distinct file.

Available `options`:
 - `resetPath` when enabled, the path history will only contain the `newPath`

### File#toJSON()

Returns a cloned object that can be JSON-serialized.

### File#toString()

Returns a string representation via `Vinyl#inspect()` useful for logging.

### File.fromObject(input, tree)

Takes a plain object and converts it into a `File` instance.

### File.id()

The id generator for files, exposed here to allow public use and customization.


[coveralls-badge]: https://img.shields.io/coveralls/makojs/tree.svg
[coveralls]: https://coveralls.io/github/makojs/tree
[david-badge]: https://img.shields.io/david/makojs/tree.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/tree.svg
[david-dev]: https://david-dm.org/makojs/tree#info=devDependencies
[david]: https://david-dm.org/makojs/tree
[npm-badge]: https://img.shields.io/npm/v/mako-tree.svg
[npm]: https://www.npmjs.com/package/mako-tree
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/a77a3cfc-85a9-48d0-997a-4057eebb8bea/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/a77a3cfc-85a9-48d0-997a-4057eebb8bea
