'use strict'

let convert = require('convert-source-map')
let compile = require('cssnano').process
let debug = require('debug')('mako-cssnano')
let utils = require('mako-utils')

module.exports = function () {
  debug('initialize')

  return function (mako) {
    mako.prewrite('css', function * cssnano (file, build) {
      let relative = utils.relative(file.path)
      debug('minifying %s', relative)

      let before = utils.size(file.contents, true)
      let result = yield compile(file.contents.toString(), {
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
      debug('minified %s %s', relative, utils.sizeDiff(before, after))
    })
  }
}
