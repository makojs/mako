
'use strict'

const compress = require('imagemin').buffer
const debug = require('debug')('mako-imagemin')
const flatten = require('array-flatten')
const utils = require('mako-utils')

module.exports = function (plugins) {
  debug('initialize %j', plugins)

  return function (mako) {
    plugins.forEach(function (plugin) {
      mako.prewrite(plugin.extensions, function * imagemin (file) {
        const relative = utils.relative(file.path)
        debug('compressing %s', relative)

        const before = utils.size(file.contents, true)
        file.contents = yield compress(file.contents, { plugins: load(plugin.use) })

        const after = utils.size(file.contents, true)
        debug('compressed %s %s', relative, utils.sizeDiff(before, after))
      })
    })
  }
}

function load (list) {
  return list.map(function (config) {
    const args = flatten.from([ config ])
    return require(args.shift()).apply(null, args)
  })
}
