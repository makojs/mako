
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should support specifying an alternate filename',
    params: { filename: 'mako.json' },
    expected: function (config) {
      assert.equal(config.path, path.resolve(__dirname, 'mako.json'))
    }
  }
]
