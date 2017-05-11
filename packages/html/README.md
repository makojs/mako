# mako-html

> A plugin bundle for parsing HTML files for other front-end asset dependencies.

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

## Purpose

Parses HTML using [deps-html](https://bitbucket.org/jongleberry/deps-html),
adding external resources to the dependency tree. Currently, the supported
resources include:

 - scripts (via `script[src]`)
 - stylesheets (via `link[rel="stylesheet"]`)
 - images (via `img[src]`)

This plugin only adds the aforementioned files to the dependency tree, the rest
of the build logic is deferred to other plugins, such as
[mako-js](https://github.com/makojs/js) and
[mako-css](https://github.com/makojs/css).

## API

### html([options])

Initializes the plugin, available `options` include:

 - `images` whether or not to process image dependencies (default: `true`)
 - `stylesheets` whether or not to process stylesheet dependencies (default: `true`)
 - `scripts` whether or not to process script dependencies (default: `true`)


[coveralls-badge]: https://img.shields.io/coveralls/makojs/html.svg
[coveralls]: https://coveralls.io/github/makojs/html
[david-badge]: https://img.shields.io/david/makojs/html.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/html.svg
[david-dev]: https://david-dm.org/makojs/html#info=devDependencies
[david]: https://david-dm.org/makojs/html
[npm-badge]: https://img.shields.io/npm/v/mako-html.svg
[npm]: https://www.npmjs.com/package/mako-html
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/82eb54b2-99dd-4cdc-a487-5917cd9d5e84/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/82eb54b2-99dd-4cdc-a487-5917cd9d5e84
