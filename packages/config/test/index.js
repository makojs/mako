/* eslint-env mocha */

'use strict'

const chai = require('chai')
const config = require('..')
const glob = require('globby').sync
const path = require('path')

chai.use(require('chai-as-promised'))
const assert = chai.assert
const pwd = process.cwd()

describe('mako-config', function () {
  glob(path.resolve(__dirname, 'fixtures/*/spec.js'))
    .map(prepare)
    .forEach(run)
})

function prepare (fixture) {
  const dir = path.dirname(fixture)
  const name = path.basename(dir)
  const spec = require(fixture)

  return {
    name: name,
    dir: dir,
    spec: spec
  }
}

function run (fixture) {
  describe('fixture: ' + fixture.name, function () {
    beforeEach(function () {
      process.chdir(fixture.dir)
    })

    afterEach(function () {
      delete process.env.NODE_ENV
      process.chdir(pwd)
    })

    fixture.spec.forEach(function (spec) {
      it(spec.description, function () {
        if (spec.env) process.env.NODE_ENV = spec.env

        let promise = config(spec.params).then(spec.expected)
        return spec.error
          // FIXME: remove the ternary once Qix-/node-error-ex#6 is addressed
          // ? assert.isRejected(promise, typeof spec.error === 'string' ? spec.error : undefined)
          ? assert.isRejected(promise, spec.error)
          : promise
      })

      it(spec.description + ' (sync)', function () {
        if (spec.env) process.env.NODE_ENV = spec.env

        if (spec.error) {
          assert.throws(() => config.sync(spec.params), spec.error)
        } else {
          const result = config.sync(spec.params)
          spec.expected(result)
        }
      })
    })
  })
}
