'use strict'

let debug = require('debug')('mako-write')
let fs = require('fs')
let mkdirp = require('mkdirp')
let utils = require('mako-utils')

module.exports = function (extensions, options) {
  const config = Object.assign({}, options)
  debug('initialize %j %j', extensions, config)

  return function (mako) {
    mako.write(extensions, function write (file, build, done) {
      const relative = utils.relative(file.path)

      if (!config.force && file.initialPath === file.path) {
        let err = new Error(`will not write file ${relative} because it would clobber the original`)
        return done(err)
      }

      debug('writing %s (%s)', relative, utils.size(file.contents))
      mkdirp(file.dirname, function (err) {
        if (err) return done(err)
        fs.writeFile(file.path, file.contents, done)
      })
    })
  }
}
