/* eslint-disable no-param-reassign */

'use strict'

let debug = require('debug')('mako-str2js')
let convert = require('string-to-js')
let utils = require('mako-utils')

module.exports = function (extensions) {
  if (!extensions) extensions = [ 'txt', 'html' ]
  debug('initialize %j', extensions)

  return function (mako) {
    mako.postread(extensions, str2js)
  }

  function str2js (file) {
    let relative = utils.relative(file.path)
    if (!hasJsDependants(file)) return debug('ignoring file %s (not depended on by a js file)', relative)

    debug('converting file %s', relative)
    let before = utils.size(file.contents, true)
    file.contents = new Buffer(convert(file.contents.toString()))
    file.type = `${file.type}.js`
    let after = utils.size(file.contents, true)
    debug('converted %s %s', relative, utils.sizeDiff(before, after))
  }

  function hasJsDependants (file) {
    return file.dependants().some(file => file.type === 'js')
  }
}
