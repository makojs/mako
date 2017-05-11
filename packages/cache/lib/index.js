
'use strict'

const utils = require('./utils')

Object.assign(module.exports, require('./async'), require('./sync'))

exports.path = utils.filename
