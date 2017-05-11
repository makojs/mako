
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should fail when no config can be found',
    // FIXME: restore this test once Qix-/node-error-ex#6 is addressed
    // error: 'unable to load mako configuration'
    error: true
  }
]
