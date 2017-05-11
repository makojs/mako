
'use strict'

let Build = require('./build')
let compile = require('./compile')
let debug = require('debug')('mako:runner')
let flatten = require('array-flatten')
let Hooks = require('./hooks')
let parse = require('./parse')
let path = require('path')
let Promise = require('bluebird')
let Tree = require('mako-tree')
let utils = require('./utils')

/**
 * The core class for the mako builder. This is the public API developers will
 * use when using the JS API directly.
 *
 * @class
 */
class Runner {
  /**
   * Builds a new instance.
   *
   * Available `options`:
   *  - `concurrency` manages concurrency throughout some phases of the build
   *  - `root` the project root for the tree
   *  - `tree` a pre-existing tree
   *
   * @param {Object} [options]  Runner configuration.
   */
  constructor (options) {
    debug('initialize')
    if (!options) options = Object.create(null)
    this.hooks = new Hooks()
    this.concurrency = options.concurrency || 100
    this.tree = options.tree || new Tree(options.root)
    if (options.plugins) this.use(options.plugins)
  }

  /**
   * Add plugins to the builder. All arguments will be flattened into a single
   * array of plugin functions.
   *
   * @return {Runner}  This method is chainable.
   */
  use () {
    let plugins = flatten.from(arguments)
    plugins.forEach(plugin => {
      debug('using plugin %s', plugin.name)
      plugin(this)
    })
    return this
  }

  /**
   * Add file hooks for the given types.
   *
   * @param {String} hook       The hook name.
   * @param {String} type       The file type(s).
   * @param {Function} handler  The handler fn.
   * @return {Runner}           This method is chainable.
   */
  addFileHooks (hook, type, handler) {
    let types = flatten([ type ])
    types.forEach(type => this.hooks.add([ hook, type ], handler))
    return this
  }

  /**
   * Add build hooks.
   *
   * @param {String} hook       The hook name.
   * @param {Function} handler  The handler fn.
   * @return {Runner}           This method is chainable.
   */
  addBuildHooks (hook, handler) {
    this.hooks.add(hook, handler)
    return this
  }

  /**
   * Used by plugins to mark a file as needing to be parsed again.
   *
   * @param {File} file  The file to mark dirty.
   */
  dirty (file) {
    debug('marking file %s as dirty', utils.relative(file.path))
    file.reset()
    file.parsed = false
  }

  /**
   * Adds a preparse hook handler.
   *
   * @param {Function} handler  The handler to use.
   * @return {Runner}           This method is chainable.
   */
  preparse (handler) {
    return this.addBuildHooks('preparse', handler)
  }

  /**
   * Adds a preread hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}           This method is chainable.
   */
  preread (type, handler) {
    return this.addFileHooks('preread', type, handler)
  }

  /**
   * Adds a read hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}          This method is chainable.
   */
  read (type, handler) {
    return this.addFileHooks('read', type, handler)
  }

  /**
   * Adds a postread hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}          This method is chainable.
   */
  postread (type, handler) {
    return this.addFileHooks('postread', type, handler)
  }

  /**
   * Adds a predependencies hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}          This method is chainable.
   */
  predependencies (type, handler) {
    return this.addFileHooks('predependencies', type, handler)
  }

  /**
   * Adds a dependencies hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}          This method is chainable.
   */
  dependencies (type, handler) {
    return this.addFileHooks('dependencies', type, handler)
  }

  /**
   * Adds a postparse hook handler.
   *
   * @param {Function} handler  The handler to use.
   * @return {Runner}           This method is chainable.
   */
  postparse (handler) {
    return this.addBuildHooks('postparse', handler)
  }

  /**
   * Adds a precompile hook handler.
   *
   * @param {Function} handler  The handler to use.
   * @return {Runner}           This method is chainable.
   */
  precompile (handler) {
    return this.addBuildHooks('precompile', handler)
  }

  /**
   * Adds a postdependencies hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}          This method is chainable.
   */
  postdependencies (type, handler) {
    return this.addFileHooks('postdependencies', type, handler)
  }

  /**
   * Adds a prewrite hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}          This method is chainable.
   */
  prewrite (type, handler) {
    return this.addFileHooks('prewrite', type, handler)
  }

  /**
   * Adds a write hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}          This method is chainable.
   */
  write (type, handler) {
    return this.addFileHooks('write', type, handler)
  }

  /**
   * Adds a postwrite hook handler.
   *
   * @param {String} type       The file type(s) to add the handler for.
   * @param {Function} handler  The handler to use.
   * @return {Runner}          This method is chainable.
   */
  postwrite (type, handler) {
    return this.addFileHooks('postwrite', type, handler)
  }

  /**
   * Adds a postcompile hook handler.
   *
   * @param {Function} handler  The handler to use.
   * @return {Runner}           This method is chainable.
   */
  postcompile (handler) {
    return this.addBuildHooks('postcompile', handler)
  }

  /**
   * Runs an analysis on the given `entries` for the given `build`.
   *
   * @return {Promise}
   */
  parse () {
    let entries = normalizeEntries(this.tree.root, arguments)
    if (!entries.length) {
      return Promise.reject(new Error('an entry file is required'))
    }

    let build = new Build(this, entries, this.tree)
    return parse(build).tap(timing)
  }

  /**
   * Assembles the given `entries` for the given `build`.
   *
   * @return {Promise}
   */
  compile () {
    let entries = normalizeEntries(this.tree.root, arguments)
    if (!entries.length) {
      return Promise.reject(new Error('an entry file is required'))
    }

    let build = new Build(this, entries, this.tree)
    return compile(build).tap(timing)
  }

  /**
   * The primary public interface, runs a complete build. (ie: both analysis and
   * compile) All arguments passed here are assumed to be entries.
   *
   * @return {Promise}
   */
  build () {
    let entries = normalizeEntries(this.tree.root, arguments)
    if (!entries.length) {
      return Promise.reject(new Error('an entry file is required'))
    }

    let build = new Build(this, entries, this.tree)
    return parse(build).then(compile).tap(timing)
  }
}

// single export
module.exports = Runner

/**
 * Helper for running timing debug output and chaining the build back.
 *
 * @param {Build} build  The current build object.
 */
function timing (build) {
  utils.timing(build.timing)
}

/**
 * Convert the input args into a list of entries. Any strings will be run
 * through `path.resolve()` to ensure absolute paths are being used.
 *
 * @param {Arguments} args  The input arguments object.
 * @return {Array} entries
 */
function normalizeEntries (root, args) {
  return flatten.from(args).map(arg => {
    return typeof arg === 'string' ? path.resolve(root, arg) : arg
  })
}
