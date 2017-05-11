'use strict'

let debug = require('debug')('mako-output')
let defaults = require('defaults')
let path = require('path')
let utils = require('mako-utils')

module.exports = function (extensions, options) {
  debug('initialize %j %j', extensions, options)
  let config = defaults(options, { dir: 'build' })

  return function (mako) {
    mako.prewrite(extensions, function output (file) {
      let lastPath = file.path
      file.path = path.resolve(file.base, config.dir, file.relative)
      debug('changed path %s -> %s', utils.relative(lastPath), utils.relative(file.path))
    })
  }
}
