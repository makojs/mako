
'use strict'

let assert = require('assert')
let clone = require('clone')
let debug = require('debug')('mako-config:async')
let empty = require('is-empty')
let find = require('find-up')
let glob = require('globby')
let json = require('load-json-file')
let merge = require('merge-array')
let path = require('path')
let Promise = require('bluebird')
let readPkg = require('read-pkg-up')
let utils = require('./utils')

module.exports = Promise.coroutine(load)

/**
 * Searches for mako configuration starting from the cwd.
 *
 * It will first look for a `.makorc` file, then will check for a `package.json`
 * that has a `mako` property. Once either is found, the JSON content will be
 * normalized into configuration that the mako runner can accept.
 *
 * Available `options`:
 *  - `dir` the directory to start from (default: pwd)
 *  - `filename` use to override `.makorc` as the config file name
 *  - `package` use to override `mako` as the package.json property
 *  - `entries` use to override the list of entries set in the config
 *
 * @param {Object} options  Optional configuration.
 * @return {Object} config
 */
function * load (options) {
  let config = utils.config(options)

  debug('searching for %s', config.filename)
  let rc = yield find(config.filename, { cwd: config.dir })
  if (rc) return yield * loadFile(rc, config.overrides)

  debug('searching for package.json (property: %s)', config.property)
  let res = yield readPkg({ cwd: config.dir })
  if (config.property in res.pkg) return yield * loadJSON(res.pkg[config.property], res.path, config.overrides)

  throw new Error('unable to load mako configuration')
}

/**
 * Loads a mako configuration file.
 *
 * @param {String} file      The absolute pathname to the config file to load.
 * @param {Array} overrides  Optional user-supplied entries. (overrides config)
 * @return {Object} config
 */
function * loadFile (file, overrides) {
  assert(file, 'a filename must be provided')
  let relative = utils.relative(file)

  debug('loading %s', relative)
  let config = yield json(file)

  return yield * loadJSON(config, file, overrides)
}

/**
 * Loads mako configuration from a plain object. (parsed from either a
 * standalone config, or a package.json)
 *
 * @param {Object} object  The configuration object.
 * @param {String} file    The filename for this configuration.
 * @return {Object} config
 */
function * loadJSON (object, file, overrides) {
  debug('loading config from json %j', object)
  let original = clone(object)
  let dir = path.dirname(file)

  let env = process.env.NODE_ENV || 'development'
  if (env in object) {
    debug('merging env %s', env)
    let envConf = object[env]
    if (envConf.entries) merge(object.entries, envConf.entries)
    if (envConf.plugins) merge(object.plugins, envConf.plugins)
  }

  let result = {
    path: file,
    env: env,
    original: original,
    entries: yield normalizeEntries(overrides, object.entries, dir),
    plugins: utils.normalizePlugins(object.plugins, dir)
  }
  if (object.root) result.root = path.resolve(dir, object.root)
  if (object.concurrency) result.concurrency = object.concurrency

  debug('final config %j', result)
  return result
}

/**
 * Normalizes the list of entries. By default, the config file will contain a
 * complete list of entries. If the user passes a list of entries via the CLI,
 * that list will be used instead.
 *
 * It will return a flattened array of absolute file paths, with any globs
 * already expanded.
 *
 * @param {Array} input   The input list from the user. (if specified)
 * @param {Array} config  The list specified in the config file.
 * @param {String} dir    The location of the config file.
 * @return {Array}
 */
function normalizeEntries (input, config, dir) {
  let list = !empty(input) ? input : config
  return glob(list, { cwd: dir, realpath: true })
}
