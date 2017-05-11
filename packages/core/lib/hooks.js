
'use strict'

let debug = require('debug')('mako:hooks')
let Emitter = require('events')
let flatten = require('array-flatten')
let Plugins = require('./plugins')
let Promise = require('bluebird')
let utils = require('mako-utils')

/**
 * A helper class for managing and running hooks.
 *
 * @class
 */
class Hooks extends Emitter {
  /**
   * Creates a new instance.
   */
  constructor () {
    debug('initialize')
    super()
    this.handlers = new Map()
  }

  /**
   * Generate a key from the given arguments.
   *
   * @return {String}
   */
  key () {
    return flatten.from(arguments).join('-')
  }

  /**
   * Adds a single `handler` for the given `action` and `type`.
   *
   * @param {String} key        The hook key.
   * @param {Function} handler  The handler fn.
   */
  add (key, handler) {
    let name = handler.name || '(unnamed)'
    let id = this.key(key)
    debug('%s add %s', id, name)

    if (!this.handlers.has(id)) {
      this.handlers.set(id, new Plugins(id))
    }

    this.handlers.get(id).use(handler)
  }

  /**
   * Runs the given handlers for the given `action` and `type`.
   *
   * @param {String} hook  The hook key.
   * @return {Promise}
   */
  run (hook, args) {
    let key = this.key(hook)
    if (!this.handlers.has(key)) return Promise.resolve()

    let plugins = this.handlers.get(key)
    let timer = utils.timer()

    debug('running %s', key)
    return plugins.run(args)
      .finally(() => debug('ran %s (took %s)', key, timer()))
  }
}

// single export
module.exports = Hooks
