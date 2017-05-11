/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let Runner = require('../lib/runner')
let mako = require('..')

describe('mako', function () {
  it('should export a function', function () {
    assert.isFunction(mako)
  })

  it('should return a runner instance', function () {
    assert.instanceOf(mako(), Runner)
  })

  it('should also export the Runner itself', function () {
    assert.strictEqual(mako.Runner, Runner)
  })
})
