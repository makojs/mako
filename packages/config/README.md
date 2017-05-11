# mako-config

> A helper for loading mako build config from a file.

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

This helper is for loading mako build configuration, allowing easy use among
different tools.

## Usage

```js
var load = require('mako-config')

// async
load().then(function (config) {
  // config.entries
  // config.plugins
})

// sync
let config = load.sync()
// config.entries
// config.plugins
```

## Configuration File Structure

If you are using a standalone file, (eg: `.makorc`) the structure below will be
the entire JSON object contained. If you are using a `package.json`, the JSON
will be contained by a property. (the default is `mako`)

### root

If specified, this allows you to set a custom root/base path for `entries`.

**NOTE:** paths are still resolved relative to the config file location, but
when these files are added to the mako tree, their `base` path will be this
custom value.

### entries

This will be an array of glob patterns that will be resolved to form a single
list of entry files. The patterns will all be resolved relative to the config
file's location.

```json
{
  "entries": [
    "index.{js,css}",
    "pages/**/index.{js,css}",
    "public/**"
  ]
}
```

### plugins

This will be an array of plugins to load, they can either be installed modules
or point to local modules of your own:

```json
{
  "plugins": [
    "mako-browser",
    "./local-plugin.js"
  ]
}
```

By default, no arguments will be passed during initialization. To change this,
use an array:

```json
{
  "plugins": [
    [ "mako-browser", { "output": "dist" } ]
  ]
}
```

### concurrency

If you want to set the concurrency level, you can use this property as a number.

### env

When you want to load plugins or entries only in a specific `NODE_ENV`, you can
create an object here for each of those environments. (the default env is
"development")

In this example, we add JS and CSS minification (via uglify and cleancss
respectively) when we run with `NODE_ENV=production`:

```json
{
  "env": {
    "production": {
      "plugins": [
        "mako-uglify",
        "mako-cleancss"
      ]
    }
  }
}
```

The structure underneath each env is identical to the root level, and both
`entries` and `plugins` will be appended to those defined at the root.

## API

### load([options])

This function loads mako config starting for a project.

It starts in the `dir` and searches up for a standalone file first, such as a
`.makorc`. If one is found, that is taken immediately. (there is **no** cascade)

If this yields no config, it will then search for the nearest `package.json` in
a similar fashion, looking for one with the `mako` property.

If no valid configuration is found, the promise will be rejected.

Available `options`:

 - `dir` the starting directory (default: pwd)
 - `filename` the config filename to search for (default: `.makorc`)
 - `property` the `package.json` property to use (default: `mako`)
 - `overrides` user-supplied overrides for the entries

It returns a promise that resolves with an object. It will contain the following
keys:

 - `root`: the absolute path to an alternate root (`null` if not specified)
 - `entries`: an array of absolute file paths to all the matched entry files
 - `plugins`: an array of the initialized plugin functions
 - `concurrency`: a number for concurrency if included in the config file
 - `path`: the absolute path to the file that was loaded (aka: `file`)
 - `env`: the known environment used for this config (eg: "development")
 - `original`: a copy of the original JSON structure

### load.sync([options])

The same arguments are accepted, and the same result is returned synchronously.
(any errors will be thrown as an exception)


[coveralls-badge]: https://img.shields.io/coveralls/makojs/config.svg
[coveralls]: https://coveralls.io/github/makojs/config
[david-badge]: https://img.shields.io/david/makojs/config.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/config.svg
[david-dev]: https://david-dm.org/makojs/config#info=devDependencies
[david]: https://david-dm.org/makojs/config
[npm-badge]: https://img.shields.io/npm/v/mako-config.svg
[npm]: https://www.npmjs.com/package/mako-config
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/0cc5c022-f36c-4ff4-8eff-5e897d21457d/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/0cc5c022-f36c-4ff4-8eff-5e897d21457d
