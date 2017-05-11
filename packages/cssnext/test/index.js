/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let fs = require('fs')
let mako = require('mako')
let cssnext = require('..')
let path = require('path')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('cssnext plugin', function () {
  it('should compile css using cssnext', function () {
    let entry = fixture('simple/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('simple/expected.css'))
      })
  })

  it('should set file.sourceMap', function () {
    let entry = fixture('sourcemaps/index.css')

    return mako()
      .use(plugins({ sourceMaps: true }))
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert(file.sourceMap, 'expected a sourceMap property')
      })
  })
})

function plugins (options) {
  return [
    cssnext(options),
    buffer('css')
  ]
}

function expected (file) {
  return fs.readFileSync(fixture(file), 'utf8').trim()
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
