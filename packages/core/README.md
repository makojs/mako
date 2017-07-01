# mako (aka: core)

> The coordinator for mako builds.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]


## API

### mako([options])

Returns a new `Runner` instance, no need for the `new` keyword.

Available `options`:
 - `root` the project root (default: `pwd`)
 - `plugins` a list of [plugins][plugins] to add during init
 - `tree` a predefined tree (eg: loading from [mako-cache][cache])
 - `concurrency` used internally to set parallel concurrency limits

### mako.Runner

The `Runner` class is exposed publicly to allow for advanced extensions.

### runner.use(...plugins) *(chainable)*

Adds a new plugin to the runner. Each plugin is a `Function`, so any nested
arrays will be flattened, allowing you to nest freely. (particularly useful for
bundles)

### runner.build(...entries)

The primary public interface, which runs both parse and compile for the given
`entries`. It returns a `Promise` that resolves with a `Build` object that
contains some information about the build itself.

### runner.parse(...entries)

Runs parse for the passed `entries`. This method isn't typically used directly,
but it can be useful for priming the tree for doing watches or inspecting the
dependency tree.

It returns a `Promise` that resolves with a `Build` object.

### runner.compile(...entries)

Runs compile for the given `entries`, this will skip the parse phase in case you
know it has already been finished. (such as when calling `runner.parse()`
manually)

It returns a `Promise` that resolves with a `Build` object.

### runner.{hook}(extensions, handler)

Registers a handler for a specific `hook`, see [the wiki][hooks] for more
information. There is a different method for each of the available hooks.

### Build

This object is returned from each call to build/parse/compile, and it is shared
by plugins throughout the build for holding the current tree, tracking timing
and interacting with the core runner.

Described below is the public API primarily for end-users, but it is not exposed
publicly at this time. Plugin authors should refer to the wiki for more
information about plugin-specific APIs.

### build.entries

This is an array of the entry files that were triggered for this build.

### build.tree

This is a reference to the tree in use during the current phase.

If returned from `runner.parse()`, it will be a reference to `runner.tree`, so
don't modify this tree unless you know exactly what you're doing.

If returned from either `runner.compile()` or `runner.build()`, this will be the
same tree used during the compile phase. This tree is safe to modify, but it
won't do anything, since the build is already complete.

### build.runner

A reference to the `runner` that initiated this build.


[cache]: ../cache
[cli]: ../cli
[david-badge]: https://img.shields.io/david/makojs/core.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/core.svg
[david-dev]: https://david-dm.org/makojs/core#info=devDependencies
[david]: https://david-dm.org/makojs/core
[hooks]: https://github.com/makojs/core/wiki/Hooks
[mako-browser]: ../browser
[mako-static-site]: ../static-site
[mako-tree]: ../tree
[npm-badge]: https://img.shields.io/npm/v/mako.svg
[npm]: https://www.npmjs.com/package/mako
[plugins]: https://github.com/makojs/core/wiki/Plugins
[server]: ../serve
