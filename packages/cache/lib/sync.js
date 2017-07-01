
'use strict'

// dependencies
let debug = require('debug')('mako-cache:sync')
let fs = require('fs')
let mkdirp = require('mkdirp').sync
let path = require('path')
let rm = require('rimraf').sync
let Tree = require('mako-tree')
let utils = require('./utils')
let write = require('write-file-atomic').sync
let zlib = require('zlib')

// exports
exports.loadSync = load
exports.saveSync = save
exports.clearSync = clear

/**
 * Loads a mako build cache file based on the project root.
 *
 * @param {String} root  User-supplied configuration.
 * @return {Tree} tree   The tree derived from the cache. (null if no file)
 */
function load (root) {
  let timer = utils.timer()
  debug('loading cache')
  if (!root) root = process.cwd()
  let file = utils.filename(root)
  debug('project root %s has expected cache file %s', utils.relative(root), file)

  if (!fs.existsSync(file)) {
    debug('file %s not found', file)
    return null
  }

  let buf = fs.readFileSync(file)
  let contents = zlib.gunzipSync(buf)
  let tree = Tree.fromString(contents.toString())
  debug('loaded %s from %s in %s', utils.size(buf), file, timer())
  return tree
}

/**
 * Saves a mako build cache file for the given tree. The given `tree.root` will
 * be used to determine the output filename. (not customizable)
 *
 * @param {Tree} tree  The build tree to cache.
 */
function save (tree) {
  let timer = utils.timer()
  debug('saving cache for project with root %s', utils.relative(tree.root))
  let file = utils.filename(tree.root)
  debug('expected cache file %s', file)
  let dir = path.dirname(file)
  mkdirp(dir)
  let contents = zlib.gzipSync(Buffer.from(tree.toString()))
  write(file, contents)
  debug('saved %s as %s (took %s)', utils.size(contents), file, timer())
  return file
}

/**
 * Delete cache files from disk. If a `root` is provided, then only the cache
 * file for that project will be deleted.
 *
 * @param {String} root  A specific project root to delete.
 */
function clear (root) {
  let file = root ? utils.filename(root) : utils.dir()
  rm(file)
  return file
}
