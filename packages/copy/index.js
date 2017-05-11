
'use strict'

let cp = require('quickly-copy-file')
let debug = require('debug')('mako-copy')
let fs = require('mz/fs')
let utils = require('mako-utils')

module.exports = function (extensions, options) {
  debug('initialize %j %j', extensions, options)
  let config = Object.assign({ force: false }, options)

  return function (mako) {
    mako.write(extensions, function * copy (file, build) {
      let modified = yield check(file, config.force)
      if (!modified) {
        return debug('file %s not modified, so will not copy', utils.relative(file.path))
      }

      let src = file.initialPath
      let dest = file.path
      debug('copying %s -> %s', utils.relative(src), utils.relative(dest))
      yield cp(src, dest)
    })
  }
}

/**
 * Helper to check the given `file`. The callback just tells us whether the
 * input file has been modified. (and thus should be copied)
 *
 * @param {File} file      The input file.
 * @param {Boolean} force  When set, always copy.
 * @return {undefined}
 */
function * check (file, force) {
  if (force) return true

  try {
    let stat = yield fs.stat(file.path)
    return modified(file.stat, stat)
  } catch (err) {
    return true
  }
}

/**
 * Compare 2 fs.Stats to see if `src` has been updated more recently that `dst`.
 * In other words, `src` needs to be copied.
 *
 * @param {fs.Stat} src  The input file.
 * @param {fs.Stat} dst  The output file.
 * @return {Boolean}
 */
function modified (src, dst) {
  if (!src || !dst) return true
  return src.mtime.getTime() > dst.mtime.getTime()
}
