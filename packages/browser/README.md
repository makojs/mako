# mako-browser

> A plugin bundle for front-end workflows.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]


## Usage

This plugin is designed for front-end build workflows. A lot of concepts are
merged from [Component][component], [Duo][duo] and [Browserify][browserify].

## JS

You can simply write your JS using CommonJS modules. (like you would in node)

```js
// index.js
var sum = require('./sum');
console.log(sum(2, 2));
// > 4

// sum.js
module.exports = function (a, b) {
  return a + b;
};
```

When you run `index.js` through mako, it will bundle all the dependencies you've
linked to recursively into a single file. (by default, that file will be
`build/index.js`)

For working with 3rd-party code, this plugin allows you to use npm to manage
your dependencies. If you're familiar with Node, your JS code will be identical.
(in fact, the goal will be to make that code able to run in both environments)

```js
// index.js
var _ = require('lodash');
console.log(_.fill(Array(3), 'a'));
// > [ 'a', 'a', 'a' ]
```

The `lodash` module will be looked for in `node_modules`, so make sure you've
used `$ npm install lodash` before you run mako.

## CSS

Up until now, there is no benefit to using this over Browserify. That changes
here, as this plugin also gives the same power to your CSS!

```css
/* index.css */
@import "./base";

h1 {
  text-decoration: underline;
}

/* base.css */
* {
  box-sizing: border-box;
}
```

When you run `index.css` through mako, it will bundle all your CSS dependencies
recursively into a single file. (by default, that file will be
`build/index.css`) Additionally, any images/fonts you link to will also be
copied over to the `build` directory, and the necessary URLs will be rewritten.

CSS can also be distributed via npm, using the same resolve semantics as for JS.
(in fact, it is the [same module][resolve] under the hood!) Where you would use
an `index.js`, an `index.css` will be looked for instead. (it will even consider
the `package.json` during resolution, such as the `main` property)

```css
@import "normalize.css";
```

This will simply import
[normalize.css](https://github.com/necolas/normalize.css) from your
`node_modules` directory, in the same way as your JS packages get resolved.

## HTML

Included in this bundle is also [mako-html][mako-html], which allows HTML files
to be parsed for dependencies to JS, CSS and even images. If your project's HTML
is static, this can be a great addition to your workflow.

## Assets

Assets refers to any external resources linked to by CSS files, such as images
and fonts. The default behavior with these is to read them into memory as
browsers, and write them to disk directly. This allows other plugins to perform
operations like image optimization without dealing with the originals.

If you are going to skip image optimization and other operations altogether, you
can get better build performance by using `copy: true` in your config. This uses
[mako-copy][mako-copy] under the hood, so it will only copy again when the
original is modified.

During development, you can get even better performance from your builds by
using `symlink: true`, which skips copying files altogether in favor of links.
This uses [mako-symlink][mako-symlink] under the hood, so it avoids creating
links that already exist. (**NOTE:** this is not ideal for a production setting,
as you probably would prefer real files instead of links)

## API

### browser([options])

Initializes the plugin, available `options` include:

 - `bundle` filename for shared JS bundle (relative to `root`)
 - `copy` copies assets to output directory
 - `css` additional CSS extensions (eg: `.styl`, `.less`, etc)
 - `js` additional JS extensions (eg: `.coffee`, `.es`, etc)
 - `output` sets the output directory name (default: `build`)
 - `resolve` additional arguments passed to [resolve][resolve] in css/js
 - `sourceMaps` allows turning on source-maps for js and css
 - `symlink` symlinks assets to the output directory


[browserify]: https://browserify.org/
[component]: https://github.com/componentjs/component
[david-badge]: https://img.shields.io/david/makojs/browser.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/browser.svg
[david-dev]: https://david-dm.org/makojs/browser#info=devDependencies
[david]: https://david-dm.org/makojs/browser
[duo]: https://github.com/duojs/duo
[mako-copy]: ../copy
[mako-symlink]: ../symlink
[npm-badge]: https://img.shields.io/npm/v/mako-browser.svg
[npm]: https://www.npmjs.com/package/mako-browser
[resolve]: https://www.npmjs.com/package/resolve
