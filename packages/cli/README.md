# mako-cli

> A command line interface for running mako builds.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]


## Install

This can be installed via npm:

```sh
sudo npm install -g mako-cli
```

This will install it globally, but using it locally is likely more flexible.
Either way, you get access to a `mako` command that you can run.

## Usage

This tool takes configuration from a file, rather than passing options directly
to the CLI. This was chosen because it was more flexible and easier to maintain.
You can load config from either a `.makorc` file, or in your `package.json`
under a property called `mako`.

```json
{
  "entries": [
    "index.{js,css}"
  ],
  "plugins": [
    "mako-browser"
  ]
}
```

Upon running `mako`, it will load the `mako-browser` plugin and run on the entry
files `index.js` and `index.css`.

## API

```

  Usage: mako [options] [entries...]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -C, --cache          turn on caching
    -v, --verbose        turn on verbose logging
    -w, --watch          rebuild when changes occur
    -q, --quiet          only log errors

```

If you specify any `entries`, it will use those in place of those specified in
the `mako.json`, allowing you to do only a subset of the overall build.

## Debugging

Currently, the logging is _very_ minimal. This will be improved in future
versions, but in the meantime, you can leverage the underlying
[debug](https://www.npmjs.com/package/debug) tool by adding `DEBUG=mako*` to
your command prompt.

```sh
$ DEBUG=mako* mako index.js
```


[david-badge]: https://img.shields.io/david/makojs/cli.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/cli.svg
[david-dev]: https://david-dm.org/makojs/cli#info=devDependencies
[david]: https://david-dm.org/makojs/cli
[npm-badge]: https://img.shields.io/npm/v/mako-cli.svg
[npm]: https://www.npmjs.com/package/mako-cli
