
'use strict'

let buffer = require('mako-buffer')
let copy = require('mako-copy')
let css = require('mako-css')
let debug = require('debug')('mako-browser')
let defaults = require('defaults')
let html = require('mako-html')
let js = require('mako-js')
let output = require('mako-output')
let sourcemaps = require('mako-sourcemaps')
let stat = require('mako-stat')
let symlink = require('mako-symlink')
let write = require('mako-write')

module.exports = function (options) {
  debug('initialize %j', options)
  let config = defaults(options, {
    bundle: false,
    copy: false,
    css: null,
    js: null,
    output: 'build',
    resolve: null,
    sourceMaps: false,
    symlink: false
  })

  return function browser (mako) {
    let assets = [ css.images, css.fonts ]

    mako.use(stat([ 'html', 'js', 'json', 'css', assets ]))
    mako.use(buffer([ 'html', 'js', 'json', 'css' ]))

    mako.use(html())

    mako.use(js({
      bundle: config.bundle,
      extensions: config.js,
      resolveOptions: config.resolve,
      sourceMaps: !!config.sourceMaps
    }))

    mako.use(css({
      extensions: config.css,
      resolveOptions: config.resolve,
      sourceMaps: !!config.sourceMaps
    }))

    mako.use(output([ 'html', 'js', 'css', assets ], { dir: config.output }))
    mako.use(write([ 'html', 'js', 'css' ]))

    if (config.sourceMaps) {
      mako.use(sourcemaps([ 'js', 'css' ], { inline: config.sourceMaps === 'inline' }))
      mako.use(write('map', { force: true }))
    }

    if (config.copy) {
      mako.use(copy(assets, { force: config.copy === 'force' }))
    } else if (config.symlink) {
      mako.use(symlink(assets))
    } else {
      mako.use(buffer(assets), write(assets))
    }
  }
}
