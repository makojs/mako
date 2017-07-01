/* eslint-env mocha */

'use strict'

const assert = require('chai').assert
const utils = require('..')

describe('utils', function () {
  describe('.relative(to)', function () {
    it('should return the `to` path relative to pwd', function () {
      assert.strictEqual(utils.relative(__filename), 'test/index.js')
    })

    it('should return . if to and pwd are identical', function () {
      assert.strictEqual(utils.relative(process.cwd()), '.')
    })
  })

  describe('.size(input, [raw])', function () {
    it('should return a string', function () {
      assert.isString(utils.size('hello world'))
    })

    it('should be a human-friendly string', function () {
      assert.strictEqual(utils.size('hello world'), '11 B')
    })

    it('should work the same with a buffer', function () {
      assert.strictEqual(utils.size(Buffer.from('hello world')), '11 B')
    })

    it('should return 0 for falsy values', function () {
      assert.strictEqual(utils.size(), '0 B')
      assert.strictEqual(utils.size(null), '0 B')
      assert.strictEqual(utils.size(false), '0 B')
    })

    context('when raw is true', function () {
      it('should return a number', function () {
        assert.strictEqual(utils.size('hello world', true), 11)
      })
    })
  })

  describe('.sizeDiff(a, b)', function () {
    it('should return a string', function () {
      assert.isString(utils.sizeDiff(1000, 250))
    })

    it('should be a human-friendly string', function () {
      assert.strictEqual(utils.sizeDiff(1000, 250), '1 kB → 250 B (-75%)')
      assert.strictEqual(utils.sizeDiff(1000, 950), '1 kB → 950 B (-5%)')
    })

    it('should prefix growth with a plus sign', function () {
      assert.strictEqual(utils.sizeDiff(250, 1000), '250 B → 1 kB (+300%)')
      assert.strictEqual(utils.sizeDiff(950, 1000), '950 B → 1 kB (+5%)')
    })

    it('should round the percentage to the nearest integer', function () {
      assert.strictEqual(utils.sizeDiff(123456789, 100000000), '123 MB → 100 MB (-19%)')
      assert.strictEqual(utils.sizeDiff(123, 357), '123 B → 357 B (+190%)')
    })
  })

  describe('.timer()', function () {
    it('should return a function', function () {
      assert.isFunction(utils.timer())
    })

    describe('the returned function', function () {
      it('should return a string', function () {
        let timer = utils.timer()
        let result = timer()
        assert.isString(result)
      })

      context('when raw is true', function () {
        it('should return an hrtime array', function () {
          let timer = utils.timer()
          let result = timer(true)
          assert.isArray(result)
          assert.lengthOf(result, 2)
          assert.strictEqual(result[0], 0) // expect this to take less than 1ms
        })
      })
    })
  })
})
