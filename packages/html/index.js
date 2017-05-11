'use strict'

let debug = require('debug')('mako-html')
let defaults = require('defaults')
let deps = require('deps-html')
let isUrl = require('is-url')
let parse5 = require('parse5-utils')
let path = require('path')
let utils = require('mako-utils')

module.exports = function (options) {
  debug('initialize %j', options)
  let config = defaults(options, {
    images: true,
    scripts: true,
    stylesheets: true
  })

  return function (mako) {
    mako.dependencies('html', html)
  }

  function html (file, build) {
    debug('parsing %s', utils.relative(file.path))
    let ast = parse5.parse(file.contents.toString())
    let dependencies = deps(ast)
    let tree = build.tree

    debug('%d dependencies found:', dependencies.length)
    dependencies
      .filter(inspectDependency)
      .forEach(addDependency)

    function addDependency (dep) {
      debug('+ %s (%s)', dep.path, dep.type)
      if (!dep.path) return
      let abs = path.resolve(file.dirname, dep.path)
      let depFile = tree.findFile(abs)
      if (!depFile) depFile = tree.addFile(abs)
      file.addDependency(depFile)
    }
  }

  function inspectDependency (dep) {
    debug('> %s (%s)', dep.path, dep.type)
    if (isUrl(dep.path)) return false
    switch (dep.type) {
      case 'script': return config.scripts
      case 'stylesheet': return config.stylesheets
      case 'img': return config.images
      default: return false
    }
  }
}
