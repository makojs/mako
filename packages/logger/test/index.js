/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let log = require('..')

const levels = [ 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ]

describe('mako-logger', function () {
  afterEach(function () {
    // reset to defaults
    log.setLevel(null)
    process.exitCode = 0
  })

  describe('.getLevel()', function () {
    it('should return a string', function () {
      assert.isString(log.getLevel())
    })

    it('should be info by default', function () {
      assert.equal(log.getLevel(), 'info')
    })
  })

  describe('.setLevel(level)', function () {
    it('should change the level', function () {
      log.setLevel('verbose')
      assert.equal(log.getLevel(), 'verbose')
    })
  })

  levels.forEach(function (level) {
    describe(`.${level}(msg, ...params)`, function () {
      it('should export a function', function () {
        assert.isFunction(log[level])
      })

      it('should not blow up', function () {
        log[level]('abc %s', 123)
      })

      if (level === 'error') {
        it('should change the process exit code when used', function () {
          log.error('hello world')
          assert.strictEqual(process.exitCode, 1)
        })
      }
    })
  })

  describe('.log(level, msg, ...params)', function () {
    it('should not blow up', function () {
      log.log('silly', 'abc %s', 123)
    })
  })
})
