
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should expand advanced glob patterns',
    expected: function (config) {
      assert.sameMembers(config.entries, [
        path.resolve(__dirname, 'index.html'),
        path.resolve(__dirname, 'index.js'),
        path.resolve(__dirname, 'index.css')
      ])
    }
  },
  {
    description: 'should prune out entries that do not exist',
    expected: function (config) {
      assert.notInclude(config.entries, path.resolve(__dirname, 'does-not-exist.txt'))
    }
  },
  {
    description: 'should override the list of entries',
    params: { overrides: [ 'index.html' ] },
    expected: function (config) {
      assert.deepEqual(config.entries, [
        path.resolve(__dirname, 'index.html')
      ])
    }
  }
]
