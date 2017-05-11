
'use strict'

let convert = require('convert-source-map')
let cssnext = require('postcss-cssnext')
let debug = require('debug')('mako-cssnext')
let postcss = require('postcss')
let utils = require('mako-utils')

const compiler = postcss([ cssnext ])

module.exports = function () {
  debug('initialize')

  return function (mako) {
    mako.prewrite('css', function * cssnext (file, build) {
      let relative = utils.relative(file.path)
      debug('compiling %s', relative)

      let before = utils.size(file.contents, true)
      let result = yield compiler.process(file.contents.toString(), {
        from: file.initialPath,
        to: file.path,
        map: {
          inline: false,
          prev: file.sourceMap,
          annotation: false
        }
      })

      file.contents = new Buffer(result.css)
      file.sourceMap = convert.fromJSON(result.map).toObject()

      let after = utils.size(file.contents, true)
      debug('compiled %s %s', relative, utils.sizeDiff(before, after))
    })
  }
}
