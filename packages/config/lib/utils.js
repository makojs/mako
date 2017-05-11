
'use strict'

let clone = require('clone')
let resolve = require('resolve').sync

const filename = '.makorc'
const property = 'mako'

// merge mako utils
Object.assign(module.exports, require('mako-utils'))

// the default parameters for load (and loadSync)
exports.config = function (options) {
  const defaults = {
    dir: process.cwd(),
    filename: filename,
    property: property
  }

  return Object.assign(Object.create(null), defaults, options)
}

/**
 * Normalizes the list of plugins. For each plugin specified in the config,
 * it will initialize. (with arguments if supplied) The return value is a flat
 * list of plugin functions.
 *
 * When a plugin is specified only as a string, it will be initialized without
 * arguments. (basically accepting the defaults)
 *
 * When a plugin is specified as an array, the first item is the plugin name,
 * all other items will be forwarded as arguments.
 *
 * @param {Array} config  The list of plugins specified in the config.
 * @param {String} root   The location of the config file.
 * @return {Array}
 */
exports.normalizePlugins = function (config, root) {
  if (!config) return []
  return config
    .map(plugin => {
      if (typeof plugin === 'string') return [ plugin ]
      return clone(plugin)
    })
    .map(plugin => {
      let fn = require(resolve(plugin[0], { basedir: root }))
      return fn.apply(null, plugin.slice(1))
    })
}
