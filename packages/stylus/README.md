# mako-stylus

> A plugin for compiling [Stylus]() files into CSS.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## Purpose

 - transpiles `file.contents` for each `styl` file during `parse`

## API

### stylus([options])

Create a new plugin instance, with the following `options` available:

 - `extensions` the file extensions to process (default: `styl`)
 - `plugins` plugins for the stylus compiler
 - `sourceMaps` specify `true` to enable source-maps (default: `false`)
 - `sourceRoot` specifies the path used as the source map root (default: `"mako://"`)


[david-badge]: https://img.shields.io/david/makojs/stylus.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/stylus.svg
[david-dev]: https://david-dm.org/makojs/stylus#info=devDependencies
[david]: https://david-dm.org/makojs/stylus
[npm-badge]: https://img.shields.io/npm/v/mako-stylus.svg
[npm]: https://www.npmjs.com/package/mako-stylus
[stylus]: http://stylus-lang.com
