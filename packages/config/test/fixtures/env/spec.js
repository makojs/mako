
const assert = require('chai').assert
const path = require('path')

module.exports = [
  {
    description: 'should assume development when not otherwise specified',
    expected: function (config) {
      assert.equal(config.env, 'development')
      assert.deepEqual(config.entries, [ path.resolve(__dirname, 'index.html') ])
      assert.deepEqual(config.plugins, [ 'default', 'dev' ])
    }
  },
  {
    description: 'should merge config when a specified env is found',
    env: 'production',
    expected: function (config) {
      assert.equal(config.env, 'production')
      assert.include(config.entries, path.resolve(__dirname, 'production.js'))
      assert.deepEqual(config.plugins, [ 'default', 'prod' ])
    }
  },
  {
    description: 'should handle an empty env config without blowing up',
    env: 'stage',
    expected: function (config) {
      assert.equal(config.env, 'stage')
      assert.deepEqual(config.entries, [ path.resolve(__dirname, 'index.html') ])
      assert.deepEqual(config.plugins, [ 'default' ])
    }
  },
  {
    description: 'should handle an missing env config without blowing up',
    env: 'does not exist',
    expected: function (config) {
      assert.equal(config.env, 'does not exist')
      assert.deepEqual(config.entries, [ path.resolve(__dirname, 'index.html') ])
      assert.deepEqual(config.plugins, [ 'default' ])
    }
  }
]
