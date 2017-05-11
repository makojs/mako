# mako-babel

> A plugin that transpiles ES6 code using [babel][babel].

[![npm version][npm-badge]][npm]
[![coverage][coveralls-badge]][coveralls]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]
[![nsp status][nsp-badge]][nsp]

## Purpose

 - transpiles `file.contents` using [babel][babel]
 - can output inline source-maps which [mako-js][mako-js] respects during packing
 - respects `.babelrc` files for configuration (assumes `node_modules` are precompiled)

## API

### babel(options)

Available `options` include:
 - `extensions`: a list of extensions to compile. (default: `js`)
 - `only`: a whitelist of files (globs, functions and regex allowed) to compile (takes precedence over `ignore`)
 - `ignore`: a blacklist of files to compile
 - `sourceMaps`: turn on to enable source maps
 - `plugins`: list of plugins to include when running babel
 - `presets`: list of presets to include when running babel

This plugin does not expose a lot of configuration, as using a `.babelrc` file is encouraged.

**NOTE:** by default, this module ignores anything in `node_modules` by default. Any modules should be precompiled
before being published to NPM. If there is enough demand for it, I will consider adding configuration for other
workflows. (although I will point out it is discouraged by the babel team as far as I can tell)


[babel]: http://babeljs.io/
[coveralls-badge]: https://img.shields.io/coveralls/makojs/babel.svg
[coveralls]: https://coveralls.io/github/makojs/babel
[david-badge]: https://img.shields.io/david/makojs/babel.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/babel.svg
[david-dev]: https://david-dm.org/makojs/babel#info=devDependencies
[david]: https://david-dm.org/makojs/babel
[mako-js]: ../js
[npm-badge]: https://img.shields.io/npm/v/mako-babel.svg
[npm]: https://www.npmjs.com/package/mako-babel
[nsp-badge]: https://nodesecurity.io/orgs/mako/projects/8069eae6-647f-48f9-b6dc-bd6f224008c4/badge
[nsp]: https://nodesecurity.io/orgs/mako/projects/8069eae6-647f-48f9-b6dc-bd6f224008c4
