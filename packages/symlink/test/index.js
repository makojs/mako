/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let fs = require('fs')
let mako = require('mako')
let path = require('path')
let rm = require('rimraf')
let symlink = require('..')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('symlink plugin', function () {
  afterEach(function (done) {
    rm(fixture('**/build'), done)
  })

  it('should symlink the input file to the output location', function () {
    let entry = fixture('simple/index.txt')

    return mako({ root: fixture('simple') })
      .use(output('txt'))
      .use(symlink('txt'))
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        let stat = fs.lstatSync(file.path)
        assert.isTrue(stat.isSymbolicLink())
      })
  })
})

function output (extensions) {
  return function (mako) {
    mako.prewrite(extensions, function output (file) {
      file.path = path.resolve(file.base, 'build', file.relative)
    })
  }
}
