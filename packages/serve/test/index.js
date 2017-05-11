/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let buffer = require('mako-buffer')
let copy = require('mako-copy')
let fs = require('fs')
let isGeneratorFn = require('is-generator-function')
let koa = require('koa')
let output = require('mako-output')
let path = require('path')
let request = require('supertest')
let rm = require('rimraf')
let serve = require('..')
let stat = require('mako-stat')
let write = require('mako-write')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('mako-serve', function () {
  afterEach(function (done) {
    rm(fixture('*/build'), done)
  })

  it('should be a function', function () {
    assert.isFunction(serve)
  })

  it('should return an object with a middleware property that is a generator', function () {
    let mako = serve({
      root: fixture('simple'),
      entries: [ 'a' ]
    })

    assert.isTrue(isGeneratorFn(mako.middleware), 'expected a generator function')
  })

  it('should build entry files before responding', function (done) {
    let app = init({
      root: fixture('simple'),
      entries: [ fixture('simple/a.txt') ],
      plugins: [ output('txt'), copy('txt') ]
    })

    request(app.listen())
      .get('/a.txt')
      .expect(200, 'A\n', done)
  })

  it('should respond with 404 for files that are not part of the build', function (done) {
    let app = init({
      root: fixture('simple'),
      entries: [ fixture('simple/a.txt') ],
      plugins: [ output('txt'), copy('txt') ]
    })

    request(app.listen())
      .get('/b.txt')
      .accept('text')
      .expect(404, done)
  })

  it('should serve the output file (not the source file)', function (done) {
    let app = init({
      root: fixture('simple'),
      entries: [ fixture('simple/a.txt') ],
      plugins: [ buffer('txt'), lowercase('txt'), output('txt'), write('txt') ]
    })

    request(app.listen())
      .get('/a.txt')
      .accept('text')
      .expect(200, 'a\n', done)
  })

  it('should build dependency files (and serve the output file)', function (done) {
    let app = init({
      root: fixture('deps'),
      entries: [ fixture('deps/a.txt') ],
      plugins: [ addDependency, buffer('txt'), lowercase('txt'), output('txt'), write('txt') ]
    })

    let srv = request(app.listen())

    srv
      .get('/a.txt')
      .accept('text')
      .expect(200, 'a\n', function () {
        srv.get('/b.txt')
          .accept('text')
          .expect(200, 'b\n', done)
      })

    function addDependency (mako) {
      mako.dependencies('txt', function (file, build) {
        if (file.basename === 'a.txt') {
          file.addDependency(build.tree.addFile(fixture('deps/b.txt')))
        }
      })
    }
  })

  it('should build/serve dependency files (even when added during the build phase)', function (done) {
    let app = init({
      root: fixture('deps'),
      entries: [ fixture('deps/a.txt') ],
      plugins: [ addDependency, buffer('txt'), output('txt'), write('txt') ]
    })

    let srv = request(app.listen())

    srv.get('/a.txt')
      .accept('text')
      .expect(200, function () {
        srv.get('/c.txt')
          .accept('text')
          .expect(200, 'c', done)
      })

    function addDependency (mako) {
      mako.dependencies('txt', function (file, build) {
        if (file.basename === 'a.txt') {
          file.addDependency(build.tree.addFile(fixture('deps/b.txt')))
        }
      })

      mako.postdependencies('txt', function (file, build) {
        if (file.basename === 'a.txt') {
          let dep = build.tree.addFile(fixture('deps/c.txt'))
          dep.contents = new Buffer('c')
          file.addDependency(dep)
        }
      })
    }
  })

  it('should throw when no entries are defined', function () {
    assert.throws(() => {
      serve({
        root: fixture('simple'),
        plugins: [ output('txt'), copy('txt') ]
      })
    })
  })

  context('watcher', function () {
    after(function (done) {
      fs.writeFile(fixture('simple/a.txt'), 'A\n', done)
    })

    it('should rebuild automatically when changes happen', function (done) {
      let entry = fixture('simple/a.txt')

      let mako = serve({
        root: fixture('simple'),
        entries: [ entry ],
        plugins: [ stat('txt'), buffer('txt'), output('txt'), write('txt') ]
      })

      mako.watcher.once('ready', () => fs.writeFileSync(entry, 'a'))
      mako.watcher.once('change', (file) => assert.strictEqual(file.path, entry))

      let app = koa().use(mako.middleware)
      let srv = request(app.listen())

      // wait long enough for the rebuild to complete
      setTimeout(function () {
        srv.get('/a.txt')
          .accept('text')
          .expect(200, 'a', done)
      }, 250)
    })
  })
})

function init (options) {
  let app = koa()
  let mako = serve(options)
  app.use(mako.middleware)
  return app
}

function lowercase (ext) {
  return function (mako) {
    mako.postread(ext, function (file) {
      file.contents = new Buffer(file.contents.toString().toLowerCase())
    })
  }
}
