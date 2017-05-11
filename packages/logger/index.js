
'use strict'

let winston = require('winston')
let levels = [ 'log', 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ]

const defaultLevel = winston.level

winston.cli()

exports.getLevel = function () {
  return winston.level
}

exports.setLevel = function (level) {
  winston.level = level || defaultLevel
}

levels.forEach(level => {
  exports[level] = function () {
    if (level === 'error') process.exitCode = 1
    winston[level].apply(winston, arguments)
  }
})

exports.fatal = function () {
  winston.error.apply(winston, arguments)
  process.exit(1)
}
