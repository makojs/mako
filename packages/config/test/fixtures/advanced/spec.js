
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should resolve a supplied root relative to the file',
    expected: function (config) {
      assert.equal(config.root, path.resolve(__dirname, 'dir'))
    }
  },
  {
    description: 'should include concurrency if specified',
    expected: function (config) {
      assert.strictEqual(config.concurrency, 250)
    }
  },
  {
    description: 'should resolve vendor plugins',
    expected: function (config) {
      assert.include(config.plugins, 'vendor')
      assert.include(config.plugins, 'a')
    }
  },
  {
    description: 'should resolve local plugins',
    expected: function (config) {
      assert.include(config.plugins, 'local')
    }
  }
]
