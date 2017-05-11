
'use strict'

const md5 = require('md5-hex')
const os = require('os')
const path = require('path')

// merge mako utils here
Object.assign(module.exports, require('mako-utils'))

/**
 * Generates the path to a cache file. The following pattern represents the
 * structure used in the calculation.
 *
 * > $TMP/mako/cache/${md5(root)}.json.gz
 *
 * @param {String} root   The project root path.
 * @return {String} file  The computed cache file path.
 */
exports.filename = function (root) {
  return path.resolve(exports.dir(), `${md5(root)}.json.gz`)
}

/**
 * Generates the root path for cache files. Useful for knowing what directory to
 * clean up manually.
 *
 * @return {String} dir  The root directory mako uses for cache files.
 */
exports.dir = function () {
  return path.resolve(os.tmpdir(), 'mako/cache')
}
