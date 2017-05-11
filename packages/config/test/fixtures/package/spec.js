
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should fall back to package.json when .makorc missing',
    expected: function (config) {
      assert.equal(config.path, path.resolve(__dirname, 'package.json'))
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
    description: 'should allow specifying a different package.json property',
    params: { property: 'foo' },
    expected: function (config) {
      assert.deepEqual(config.entries, [
        path.resolve(__dirname, 'index.js')
      ])
    }
  }
]
