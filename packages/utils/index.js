
'use strict'

// dependencies
const figures = require('figures')
const path = require('path')
const hrtime = require('pretty-hrtime')
const bytes = require('pretty-bytes')

// cache this value as a constant, we assume it never changes
const pwd = process.cwd()

/**
 * Helper for outputting an absolute path relative to pwd.
 *
 * @param {String} to  The absolute path to render.
 * @return {String} relative
 */
exports.relative = function (to) {
  if (pwd === to) return '.'
  return path.relative(pwd, to)
}

/**
 * Helper for determining the real size in bytes of an input buffer/string.
 *
 * @param {Buffer} input  The input to measure.
 * @param {Boolean} raw   Turn on to get a raw number.
 * @return {String} size
 */
exports.size = function (input, raw) {
  let size = input ? Buffer.byteLength(input) : 0
  return raw ? size : bytes(size)
}

exports.sizeDiff = function (a, b) {
  let before = bytes(a)
  let after = bytes(b)
  let arrow = figures.arrowRight
  let delta = Math.round(((b - a) / a) * 100)
  let diff = delta > 0 ? `+${delta}%` : `${delta}%`

  return `${before} ${arrow} ${after} (${diff})`
}

/**
 * Helper for high-res timing. A function is returned that, when invoked,
 * returns the elapsed time.
 *
 * @return {Function} timer
 */
exports.timer = function () {
  let start = process.hrtime()
  return raw => {
    let elapsed = process.hrtime(start)
    return raw ? elapsed : hrtime(elapsed)
  }
}
