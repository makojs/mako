
'use strict'

let debug = require('debug')('mako:plugins')
let flatten = require('array-flatten')
let pretty = require('pretty-hrtime')
let Promise = require('bluebird')
let wrapped = require('wrapped')

/**
 * A helper for wrapping and running plugins.
 *
 * TODO: move this to it's own module.
 *
 * @class
 */
class Plugins {
  /**
   * Creates a new instance.
   *
   * @param {String} id  Used for debug output and in the returned stats.
   */
  constructor (id) {
    debug('initialize %s', id)
    this.id = id
    this.fns = []
  }

  /**
   * Adds the given plugin functions to the queue. (arrays are flattened)
   */
  use () {
    let fns = this.fns
    let plugins = flatten.from(arguments).map(wrap)
    plugins.forEach(plugin => debug('use %s:%s', this.id, plugin.name))
    fns.push.apply(fns, plugins)
  }

  /**
   * Runs the plugins with the given arguments.
   *
   * @param {Array} args  The arguments to pass in.
   * @return {Promise} results
   */
  run (args) {
    debug('run %s', this.id)
    return Promise.mapSeries(this.fns, (plugin) => {
      let start = process.hrtime()
      debug('running %s:%s', this.id, plugin.name)
      return plugin.fn.apply(null, args).then(this.finish(plugin, start))
    })
  }

  /**
   * Creates a helper function for stopping the timer.
   *
   * @private
   * @param {Function} plugin  The plugin object
   * @param {Array} start      The hrtime array for when the plugin started
   * @return {Function} handler
   */
  finish (plugin, start) {
    let id = this.id
    let name = plugin.name

    return () => {
      let duration = process.hrtime(start)
      debug('finished %s:%s (took %s)', id, name, pretty(duration))

      return {
        id: id,
        plugin: name,
        duration: duration
      }
    }
  }
}

// single export
module.exports = Plugins

function wrap (fn) {
  return {
    name: fn.name || '[anonymous]',
    fn: Promise.promisify(wrapped(fn))
  }
}
