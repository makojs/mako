/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let cssnano = require('..')
let fs = require('fs')
let mako = require('mako')
let path = require('path')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('cssnext plugin', function () {
  it('should minify css', function () {
    let entry = fixture('simple/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.notInclude(file.contents.toString(), '\n')
      })
  })

  it('should set file.sourceMap', function () {
    let entry = fixture('simple/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert(file.sourceMap, 'expected a sourceMap property')
      })
  })
})

function plugins (options) {
  return [
    buffer('css'),
    cssnano(options)
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
