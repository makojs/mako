/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let mako = require('mako')
let output = require('..')
let path = require('path')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('output plugin', function () {
  it('should default to :pwd/build/:relative', function () {
    let entry = fixture('simple/index.js')
    let runner = mako().use(output('js'))

    return runner.build(entry).then(function (build) {
      let file = build.tree.findFile(entry)
      assert.equal(file.path, path.resolve('./build/test/fixtures/simple/index.js'))
    })
  })

  it('should respect the root', function () {
    let entry = fixture('simple/index.js')
    let runner = mako({ root: fixture('simple') }).use(output('js'))

    return runner.build(entry).then(function (build) {
      let file = build.tree.findFile(entry)
      assert.equal(file.path, fixture('simple/build/index.js'))
    })
  })

  it('should change the dir name', function () {
    let entry = fixture('simple/index.js')
    let runner = mako({ root: fixture('simple') }).use(output('js', { dir: 'dist' }))

    return runner.build(entry).then(function (build) {
      let file = build.tree.findFile(entry)
      assert.equal(file.path, fixture('simple/dist/index.js'))
    })
  })

  it('should allow an absolute dir name', function () {
    let entry = fixture('simple/index.js')
    let runner = mako().use(output('js', { dir: '/' }))

    return runner.build(entry).then(function (build) {
      let file = build.tree.findFile(entry)
      assert.equal(file.path, path.resolve('/test/fixtures/simple/index.js'))
    })
  })

  // it('should support renaming a base directory', function () {
  //   let entry = fixture('simple/index.js')
  //   let runner = mako({ root: fixture() }).use(output('js', { rename: [ 'simple', 'output' ] }))
  //
  //   return runner.build(entry).then(function (build) {
  //     let file = build.tree.findFile(entry)
  //     assert.equal(file.path, fixture('output/index.js'))
  //   })
  // })

  it('should respect changes to file.type', function () {
    let entry = fixture('simple/index.coffee')
    let runner = mako().use(output('js'))

    runner.read('coffee', function (file) {
      file.type = 'js'
    })

    return runner.build(entry).then(function (build) {
      let file = build.tree.findFile(entry)
      assert.equal(file.type, 'js')
    })
  })
})
