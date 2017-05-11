
'use strict'

let debug = require('debug')('mako-stat')
let fs = require('fs')
let utils = require('mako-utils')

module.exports = function (extensions) {
  debug('initialize %j', extensions)

  return function (mako) {
    mako.preread(extensions, function stat (file, build, done) {
      let relative = utils.relative(file.initialPath)
      debug('checking %s', relative)

      let previous = file.stat
      fs.stat(file.initialPath, function (err, stat) {
        if (err) return done(err)
        file.stat = stat
        if (modified(previous, stat)) {
          debug('dirty %s', relative)
          build.dirty(file)
        }
        done()
      })
    })
  }
}

/**
 * Compare two `fs.Stat` objects to see if the `mtime` has changed.
 *
 * @param {fs.Stat} previous  The last stat object.
 * @param {fs.Stat} current   The new stat object.
 * @return {Boolean}
 */
function modified (previous, current) {
  if (!previous) return false // on the first pass, do not consider the file dirty/modified
  return previous.mtime.getTime() !== current.mtime.getTime()
}
