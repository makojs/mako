
'use strict'

// dependencies
let debug = require('debug')('mako-cache:async')
let fs = require('mz/fs')
let mkdirp = require('mkdirp')
let path = require('path')
let Promise = require('bluebird')
let rm = require('rimraf')
let stringify = require('json-yieldify').stringify
let Tree = require('mako-tree')
let utils = require('./utils')
let write = require('write-file-atomic')
let zlib = require('mz/zlib')

// exports
exports.load = Promise.coroutine(load)
exports.save = Promise.coroutine(save)
exports.clear = Promise.coroutine(clear)

/**
 * Loads a mako build cache file based on the project root.
 *
 * @param {String} root  User-supplied configuration.
 * @return {Tree} tree   The tree derived from the cache. (null if no file)
 */
function * load (root) {
  let timer = utils.timer()
  debug('loading cache')
  if (!root) root = process.cwd()
  let file = utils.filename(root)
  debug('project root %s has expected cache file %s', utils.relative(root), file)

  let exists = yield fs.exists(file)
  if (!exists) {
    debug('file %s not found', file)
    return null
  }

  let buf = yield fs.readFile(file)
  let contents = yield zlib.gunzip(buf)
  let tree = Tree.fromString(contents.toString())
  debug('loaded %s from %s in %s', utils.size(buf), file, timer())
  return tree
}

/**
 * Saves a mako build cache file for the given tree. The given `tree.root` will
 * be used to determine the output filename. (not customizable)
 *
 * @param {Tree} tree    The build tree to cache.
 * @param {String} file  The cache file that was written.
 */
function * save (tree) {
  let timer = utils.timer()
  debug('saving cache for project with root %s', utils.relative(tree.root))
  let file = utils.filename(tree.root)
  debug('expected cache file %s', file)
  let dir = path.dirname(file)
  yield Promise.fromCallback(done => mkdirp(dir, done))
  let str = yield Promise.fromCallback(done => stringify(tree.toJSON(), done))
  let contents = yield zlib.gzip(Buffer.from(str))
  yield Promise.fromCallback(done => write(file, contents, done))
  debug('saved %s as %s (took %s)', utils.size(contents), file, timer())
  return file
}

/**
 * Delete cache files from disk. If a `root` is provided, then only the cache
 * file for that project will be deleted.
 *
 * @param {String} root  A specific project root to delete.
 */
function * clear (root) {
  let file = root ? utils.filename(root) : utils.dir()
  yield Promise.fromCallback(done => rm(file, done))
  return file
}
