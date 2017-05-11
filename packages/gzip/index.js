'use strict'

let debug = require('debug')('mako-gzip')
let utils = require('mako-utils')
let zlib = require('zlib')

module.exports = function (extensions) {
  debug('initialize %j', extensions)

  return function (mako) {
    mako.prewrite(extensions, function gzip (file, build, done) {
      let relative = utils.relative(file.path)
      let before = utils.size(file.contents, true)
      debug('compressing %s', relative)

      zlib.gzip(file.contents, function (err, buf) {
        if (err) return done(err)

        // TODO: not adding this file as a dependency, since really isn't one.
        build.tree.addFile({
          path: `${file.path}.gz`,
          contents: buf
        })

        let after = utils.size(buf, true)
        debug('compressed %s %s', relative, utils.sizeDiff(before, after))
        done()
      })
    })
  }
}
