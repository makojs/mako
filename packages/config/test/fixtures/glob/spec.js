
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should resolve entries from glob patterns',
    expected: function (config) {
      assert.deepEqual(config.entries, [
        path.resolve(__dirname, 'a.txt'),
        path.resolve(__dirname, 'b.txt'),
        path.resolve(__dirname, 'c.txt')
      ])
    }
  },
  {
    description: 'should include the original json structure',
    expected: function (config) {
      assert.deepEqual(config.original, { entries: [ '*.txt' ] })
    }
  }
]
