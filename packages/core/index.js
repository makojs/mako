
'use strict'

let Runner = require('./lib/runner')

exports = module.exports = function (options) {
  return new Runner(options)
}

exports.Runner = Runner
