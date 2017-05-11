
'use strict'

let debug = require('debug')('mako-symlink')
let link = require('fs-symlink')
let utils = require('mako-utils')

module.exports = function (extensions) {
  debug('initialize %j', extensions)

  return function (mako) {
    mako.write(extensions, function symlink (file, build) {
      let src = file.initialPath
      let dest = file.path
      debug('symlinking %s -> %s', utils.relative(src), utils.relative(dest))
      return link(src, dest)
    })
  }
}
