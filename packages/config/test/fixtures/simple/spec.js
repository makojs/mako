
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should properly load config',
    expected: function (config) {
      assert.equal(config.path, path.resolve(__dirname, '.makorc'))
    }
  },
  {
    description: 'should not set a root automatically',
    expected: function (config) {
      assert.isUndefined(config.root)
    }
  },
  {
    description: 'should resolve entries relative to the file',
    expected: function (config) {
      assert.deepEqual(config.entries, [
        path.resolve(__dirname, 'index.html')
      ])
    }
  },
  {
    description: 'should have an empty array of plugins if not defined',
    expected: function (config) {
      assert.isArray(config.plugins)
      assert.lengthOf(config.plugins, 0)
    }
  }
]
