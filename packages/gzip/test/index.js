/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let bufferEqual = require('buffer-equal')
let fs = require('fs')
let gzip = require('..')
let mako = require('mako')
let path = require('path')
let zlib = require('zlib')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('gzip plugin', function () {
  it('should add a compressed version of the original', function () {
    let entry = fixture('simple/index.txt')

    return mako({ root: fixture('simple') })
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        let gz = build.tree.findFile(`${entry}.gz`)
        assert.isTrue(bufferEqual(gz.contents, zlib.gzipSync(file.contents)))
      })
  })
})

function plugins () {
  return [
    buffer('txt'),
    gzip('txt')
  ]
}

function buffer (extensions) {
  return function (mako) {
    mako.read(extensions, function (file, build, done) {
      fs.readFile(file.path, function (err, buf) {
        if (err) return done(err)
        file.contents = buf
        done()
      })
    })
  }
}
