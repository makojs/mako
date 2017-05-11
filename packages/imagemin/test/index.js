/* eslint-env mocha */

'use strict'

const chai = require('chai')
const fs = require('fs')
const mako = require('mako')
const imagemin = require('..')
const path = require('path')

chai.use(require('chai-as-promised'))
const assert = chai.assert

describe('imagemin plugin', function () {
  it('should shrink the file', function () {
    const runner = mako().use(imagemin([
      { extensions: 'svg', use: [ 'imagemin-svgo' ] }
    ]))
    const entry = runner.tree.addFile(path.resolve('logo.svg'))
    entry.contents = fs.readFileSync(path.resolve(__dirname, 'fixtures/test.svg'))
    const before = Buffer.byteLength(entry.contents)

    return runner.build(entry.path).then(function (build) {
      const file = build.tree.findFile(entry.path)
      const after = Buffer.byteLength(file.contents)
      assert.isAbove(before, after)
    })
  })
})
