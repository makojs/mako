
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should throw when standalone config file has invalid JSON',
    // FIXME: restore this test once Qix-/node-error-ex#6 is addressed
    // error: 'Unexpected end of input at 2:1 in .makorc'
    error: true
  }
]
