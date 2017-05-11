'use strict'

let debug = require('debug')('mako-buffer')
let fs = require('fs')
let utils = require('mako-utils')

module.exports = function (extensions) {
  debug('initialize %j', extensions)

  return function (mako) {
    mako.read(extensions, function buffer (file, build, done) {
      const relative = utils.relative(file.path)

      if (file.contents) {
        debug('skipping %s, contents already defined', relative)
        return done()
      }

      debug('reading %s', relative)
      fs.readFile(file.path, function (err, buf) {
        if (err) return done(err)
        debug('%s read (%s)', relative, utils.size(buf))
        file.contents = buf
        done()
      })
    })
  }
}
