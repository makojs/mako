
'use strict'

let core = require('babel-core')
let debug = require('debug')('mako-babel')
let defaults = require('defaults')
let utils = require('mako-utils')

let compile = core.transform
let shouldIgnore = core.util.shouldIgnore

module.exports = function (options) {
  debug('initialize %j', options)

  let config = defaults(options, {
    extensions: 'js',
    ignore: [ /node_modules/i ],
    plugins: [],
    presets: [],
    only: null,
    sourceMaps: false
  })

  return function (mako) {
    mako.postread(config.extensions, function babel (file, build) {
      if (shouldIgnore(file.path, config.ignore, config.only)) {
        return debug('ignoring %s', utils.relative(file.path))
      }

      let relative = utils.relative(file.path)
      debug('compiling %s', relative)

      let before = utils.size(file.contents, true)
      let results = compile(file.contents.toString(), {
        filename: file.path,
        sourceMaps: config.sourceMaps ? 'inline' : false,
        plugins: config.plugins,
        presets: config.presets
      })

      file.contents = new Buffer(results.code)
      file.type = 'js'

      let after = utils.size(file.contents, true)
      debug('compiled %s %s', relative, utils.sizeDiff(before, after))
    })
  }
}
