# mako-serve

> A server for automatically building and serving files built via mako.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Install

This can be installed via npm:

```sh
sudo npm install -g mako-serve
```

This will install it globally, but using it locally is likely more flexible.
Either way, you get access to a `mako-serve` command that you can run.

## How it works

On startup, the server runs an initial build. Once it is ready, it sets up a
watch for the root, and rebuilds whenever changes occur. The server itself
simply serves up the output directory as static files.

Therefore, this particular tool adds the assumption of an output directory,
which isn't managed by mako directly. The `output` config will be the same as a
tool like [mako-output](https://github.com/makojs/serve). (and will be relative
to the root)

## CLI

```

  Usage: mako-serve [options] [...entries]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -b, --base <url>      set a custom base url
    -C, --cache           turn on caching
    -c, --config <path>   use a custom config path
    -f, --favicon <path>  set the path to a favicon image
    -l, --livereload      turn on livereload
    -o, --output <path>   the output path for serving files from
    -p, --port <number>   set the server port number

```

Like [mako-cli](https://github.com/makojs/cli), this tool accepts configuration
from a file, instead of using flags for everything. The default config file is
`mako.json`, but you can specify your own via `--config <path>`. (the way this
config file is interpreted is identical to mako-cli)

If you specify any `entries`, it will use those in place of those specified in
the `mako.json`, allowing you to do only a subset of the overall build.

If you turn on caching via `--cache`, it will load and save to the cache before
and while running. (the location is the same as `mako-cli`, which is
`./mako.cache`)

## livereload

Currently, only the CLI supports livereload by adding the `--livereload` flag.
This capability will eventually be extended to the JS API as well.

When enabled, a [livereload](https://www.npmjs.com/package/livereload)
server will be started. The easiest way to develop with this is to add an
[official browser extension](http://livereload.com/extensions/), as it will
automatically detect the livereload server and start accepting commands.

To use this feature without a browser extension, you can add the following code
to your HTML:

```html
<script>
document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
 ':35729/livereload.js?snipver=1"></' + 'script>')
</script>
```

This isn't ideal though, as you need to remember to remove this snippet if you
want to copy your output files into production. To avoid this, you could also
add the JS itself to your own application, but wrapped in a conditional to check
for development/local. (so it doesn't run at all in production)

## API

The core functionality is a koa middleware, which allows you to use the JS API
to add this to your own server. (see `bin/mako-serve` for an example that you
might adapt for yourself)

### serve(options)

Creates the core functionality that you can use in your own koa app.

Available `options`:

 - `root` sets the builder root
 - `output` path relative to `root` from which to serve files
 - `entries` a list of entry files (at least 1 is required)
 - `plugins` a list of plugins (already initialized)
 - `cache` pass the location of a file in order to load and save a cache
 - `livereload` use to enable livereload via the watcher

The returned object includes the following properties:

 - `middleware` a generator function that has the core middleware
 - `watcher` the watcher instance that was created and is running
 - `livereload` if enabled, the [livereload server][livereload] instance


[david-badge]: https://img.shields.io/david/makojs/serve.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/serve.svg
[david-dev]: https://david-dm.org/makojs/serve#info=devDependencies
[david]: https://david-dm.org/makojs/serve
[livereload]: https://github.com/dominicbarnes/livereload-base
[npm-badge]: https://img.shields.io/npm/v/mako-serve.svg
[npm]: https://www.npmjs.com/package/mako-serve
