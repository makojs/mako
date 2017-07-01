
'use strict'

let basename = require('path').basename
let convert = require('convert-source-map')
let debug = require('debug')('mako-sourcemaps')
let utils = require('mako-utils')

const defaults = {
  inline: false,
  spaces: null
}

module.exports = function (extensions, options) {
  debug('initialize %j %j', extensions, options)
  let config = Object.assign({}, defaults, options)

  return function (mako) {
    mako.prewrite(extensions, sourcemaps)
  }

  /**
   * This fn is the entrypoint for the plugin, it proxies to either the
   * internal or external fn depending on config.
   *
   * @param {File} file    The current file.
   * @param {Build} build  The current build.
   */
  function sourcemaps (file, build) {
    if (config.inline) {
      inline(file)
    } else {
      external(file, build)
    }
  }

  /**
   * This prewrite hook sets the content of the `.map` file created earlier
   * and sets it's content from the source `file.sourcemap` value.
   *
   * @param {File} file    The current file.
   * @param {Build} build  The current build.
   */
  function external (file, build) {
    debug('processing external sourcemaps for %s', utils.relative(file.path))
    let mapFile = build.tree.addFile(`${file.path}.map`)
    let map = convert.fromObject(file.sourceMap)
    file.contents = Buffer.concat([
      file.contents,
      Buffer.from(`\n${mapFileComment(basename(mapFile.path), file.type)}`)
    ])
    mapFile.contents = Buffer.from(map.toJSON(config.spaces))
    file.addDependency(mapFile)
  }

  /**
   * This prewrite hook adds the sourcemap as an inline comment to the `file`.
   *
   * @param {File} file  The current build file.
   */
  function inline (file) {
    debug('processing inline sourcemaps for %s', utils.relative(file.path))
    let map = convert.fromObject(file.sourceMap)
    file.contents = Buffer.concat([
      file.contents,
      Buffer.from(`\n${map.toComment({ multiline: file.type === 'css' })}`)
    ])
  }
}

/**
 * Generates the external source-map comment added to the end of a file.
 *
 * @param {String} file  The relative path to the external sourcemap file.
 * @param {String} type  The file type. (js/css have different formats)
 * @return {String}
 */
function mapFileComment (file, type) {
  return convert.generateMapFileComment(file, { multiline: type === 'css' })
}
