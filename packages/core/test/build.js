/* eslint-env mocha */

'use strict'

let Build = require('../lib/build')
let chai = require('chai')

chai.use(require('chai-as-promised'))
let assert = chai.assert

describe('Build(runner, entries, tree)', function () {
  it('should be a constructor function', function () {
    assert.instanceOf(new Build(), Build)
  })

  it('should set the runner, entries and tree props', function () {
    let r = {}
    let e = {}
    let t = {}
    let build = new Build(r, e, t)
    assert.strictEqual(build.runner, r)
    assert.strictEqual(build.entries, e)
    assert.strictEqual(build.tree, t)
  })

  describe('#time(label)', function () {
    it('should return a function', function () {
      let build = new Build()
      assert.isFunction(build.time('test'))
    })

    it('should increment the timing counter when the fn is called', function () {
      let build = new Build()
      let timer = build.time('test')
      assert.isUndefined(build.timing.get('test'))
      timer()
      assert.isArray(build.timing.get('test'))
    })

    it('should not reset timing for the same label used multiple times', function () {
      let build = new Build()
      let timer1 = build.time('test')
      timer1()
      let timing1 = build.timing.get('test')
      let timer2 = build.time('test')
      timer2()
      let timing2 = build.timing.get('test')
      assert.notDeepEqual(timing1, timing2)
    })

    it('should not increment timing if the timer function is called more than once', function () {
      let build = new Build()
      let timer = build.time('test')
      timer()
      let timing1 = build.timing.get('test')
      timer()
      let timing2 = build.timing.get('test')
      assert.deepEqual(timing1, timing2)
    })
  })
})
