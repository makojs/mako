/* eslint-env mocha */

'use strict'

let chai = require('chai')
let fs = require('fs')
let mako = require('mako')
let path = require('path')
let rm = require('rimraf')
let write = require('..')

chai.use(require('chai-as-promised'))
let assert = chai.assert
let root = path.resolve(__dirname, 'tmp')

describe('write plugin', function () {
  afterEach(function (done) {
    rm(root, done)
  })

  it('should write the file to the output location', function () {
    let runner = mako({ root: root }).use(output('txt'), write('txt'))
    let entry = runner.tree.addFile(path.resolve(root, 'index.txt'))
    entry.contents = new Buffer('Hello World')

    return runner.build(entry).then(function (build) {
      let file = build.tree.findFile(entry.path)
      assert.isTrue(fs.existsSync(file.path))
    })
  })

  it('should fail if the path is never changed', function () {
    let runner = mako({ root: root }).use(write('txt'))
    let entry = runner.tree.addFile(path.resolve(root, 'index.txt'))
    entry.contents = new Buffer('Hello World')

    return assert.isRejected(runner.build(entry.path))
  })

  context('with options', function () {
    describe('.force', function () {
      it('should bypass the initialPath check', function () {
        let runner = mako({ root: root }).use(write('txt', { force: true }))
        let entry = runner.tree.addFile(path.resolve(root, 'index.txt'))
        entry.contents = new Buffer('Hello World')

        return runner.build(entry.path)
      })
    })
  })
})

function output (extensions) {
  return function (mako) {
    mako.prewrite(extensions, function (file) {
      file.path = path.resolve(file.base, 'build', file.relative)
    })
  }
}
