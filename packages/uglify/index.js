'use strict'

let convert = require('convert-source-map')
let debug = require('debug')('mako-uglify')
let minify = require('uglify-js').minify
let utils = require('mako-utils')

module.exports = function () {
  debug('initialize')

  return function (mako) {
    mako.prewrite('js', function uglify (file, build) {
      let relative = utils.relative(file.path)
      debug('minifying %s', relative)

      try {
        let before = utils.size(file.contents, true)
        let results = minify(file.contents.toString(), {
          fromString: true,
          inSourceMap: file.sourceMap,
          outSourceMap: !!file.sourceMap
        })

        file.contents = Buffer.from(results.code)
        if (results.map) {
          let map = convert.fromJSON(results.map)
          map.setProperty('sourcesContent', file.sourceMap.sourcesContent)
          file.sourceMap = map.toObject()
        }

        let after = utils.size(file.contents, true)
        debug('minified %s %s', relative, utils.sizeDiff(before, after))
      } catch (err) {
        err.message += ` - ${file.relative} [${err.line}:${err.col}]`
        throw err
      }
    })
  }
}
