
'use strict'

exports.error = require('koa-error')

exports.favicon = require('koa-favicon')

exports.logger = function (log) {
  return function* (next) {
    log.info('<-- %s %s', this.method, this.originalUrl)

    try {
      yield next
      log.info('--> %s %s', this.method, this.originalUrl, this.status)
    } catch (err) {
      log.error('--> %s %s %s', this.method, this.originalUrl, err.status)
    }
  }
}
