# mako-imagemin

> A plugin for compressing images with [imagemin][imagemin].

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Purpose

Uses [imagemin][imagemin] to compress `file.contents` for each configured image
type. Configuration maps file types to plugins that must be installed separately
by the end-user.

Since this plugin operates on raw buffers in `file.contents`, it is assumed that
you are loading those files into via a plugin like [mako-buffer][mako-buffer].

## API

### imagemin([plugins])

The `plugins` parameter is an array of objects, and each item is an object with
the following properties:
 - `extensions` a list of file extensions for this particular batch of plugins
 - `use` an array of imagemin plugin plugins to load

Below is an example `.makorc` that configures svg compression:

```json
{
  "plugins": [
    [ "mako-buffer", [ "svg" ] ],
    [
      "mako-imagemin", [
        { "extensions": "svg", "use": [ "imagemin-svgo" ] }
      ]
    ]
  ]
}
```


[david-badge]: https://img.shields.io/david/makojs/imagemin.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/imagemin.svg
[david-dev]: https://david-dm.org/makojs/imagemin#info=devDependencies
[david]: https://david-dm.org/makojs/imagemin
[imagemin]: https://github.com/imagemin/imagemin
[mako-buffer]: ../buffer
[npm-badge]: https://img.shields.io/npm/v/mako-imagemin.svg
[npm]: https://www.npmjs.com/package/mako-imagemin
