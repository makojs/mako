
'use strict'

let assert = require('assert')
let clone = require('clone')
let debug = require('debug')('mako-config:sync')
let empty = require('is-empty')
let find = require('find-up').sync
let glob = require('globby').sync
let json = require('load-json-file').sync
let merge = require('merge-array')
let path = require('path')
let readPkg = require('read-pkg-up').sync
let utils = require('./utils')

module.exports = load

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
function load (options) {
  let config = utils.config(options)

  debug('searching for %s', config.filename)
  let rc = find(config.filename, { cwd: config.dir })
  if (rc) return loadFile(rc, config.overrides)

  debug('searching for package.json (property: %s)', config.property)
  let res = readPkg({ cwd: config.dir })
  if (config.property in res.pkg) return loadJSON(res.pkg[config.property], res.path, config.overrides)

  throw new Error('unable to load mako configuration')
}

/**
 * Synchronous version of load.
 *
 * @param {String} file      The absolute pathname to the config file to load.
 * @param {Array} overrides  User-supplied entries. (overrides config)
 * @return {Object} config
 */
function loadFile (file, overrides) {
  assert(file, 'a filename must be provided')
  let relative = utils.relative(file)

  debug('loading %s', relative)
  let config = json(file)

  return loadJSON(config, file, overrides)
}

/**
 * Loads mako configuration from a plain object. (parsed from either a
 * standalone config, or a package.json)
 *
 * @param {Object} object  The configuration object.
 * @param {String} file    The filename for this configuration.
 * @return {Object} config
 */
function loadJSON (object, file, overrides) {
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
    entries: normalizeEntries(overrides, object.entries, dir),
    plugins: utils.normalizePlugins(object.plugins, dir)
  }
  if (object.root) result.root = path.resolve(dir, object.root)
  if (object.concurrency) result.concurrency = object.concurrency

  debug('final config %j', result)
  return result
}

/**
 * Synchronous version of normalizeEntries.
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
