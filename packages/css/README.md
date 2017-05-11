# mako-css

> A plugin for working with CSS, using npm as a package manager. In addition to
> bundling the CSS together, it also handles inlining assets or rewriting URLs
> to them.

[![npm version][npm-badge]][npm]
[![coveralls status][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

## Purpose

 - builds CSS files in a manner similar to [mako-js][mako-js], allowing npm
   packages with CSS, images, fonts, and other assets to also be modularized
 - finds dependencies via `@import "...";` and `url(...)` declarations
 - rewrites URLs relative to the output files (for easy deployment)
 - allow inlining assets like images

## API

### css(options)

Create a new plugin instance, with the following `options` available:

 - `extensions` extensions **in addition to** `.css` to resolve (eg: `.sass`)
 - `inline` used to enable asset inlining (see below for more information)
 - `resolveOptions` additional options to be passed to [resolve][resolve]
 - `sourceMaps` specify `true` to enable source-maps (default: `false`)
 - `sourceRoot` specifies the source map root (default: `"mako://"`)

### css.images

An `Array` of extensions for image files that this plugin will interact with.
You can add to this array directly, but for core support of other types, please
open an issue.

### css.fonts

An `Array` of extensions for image files that this plugin will interact with.
You can add to this array directly, but for core support of other types, please
open an issue.


## Inlining Assets

By using `options.inline`, you can allow for mako-css to inline assets into your
CSS as data URIs. This is opt-in, so the following formats are available for
configuration:

 - `true` use to inline all assets (probably not ideal for production use)
 - `<number>` indicates that only files that size (in bytes) or smaller should
   be inline. (eg: `inline: 2048` means only files <= 2KB will be inlined)
 - `fn(file)` can be used as a function to provide the most flexibility. It is
   invoked with the file as an argument, the return value is cast into a bool.


[coveralls-badge]: https://img.shields.io/coveralls/makojs/css.svg
[coveralls]: https://coveralls.io/github/makojs/css
[david-badge]: https://img.shields.io/david/makojs/css.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/css.svg
[david-dev]: https://david-dm.org/makojs/css#info=devDependencies
[david]: https://david-dm.org/makojs/css
[mako-js]: ../js
[npm-badge]: https://img.shields.io/npm/v/mako-css.svg
[npm]: https://www.npmjs.com/package/mako-css
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/d430f079-de6e-4f44-bd30-8516fa9cc1fb/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/d430f079-de6e-4f44-bd30-8516fa9cc1fb
[resolve]: https://www.npmjs.com/package/resolve
