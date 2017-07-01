/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let mako = require('mako')
let path = require('path')
let str2js = require('..')

describe('str2js plugin', function () {
  it('should convert file contents into a CommonJS module', function () {
    let runner = mako().use(str2js())
    let entry = runner.tree.addFile(path.resolve('index.js'))
    entry.contents = Buffer.from('module.exports = require("./index.txt");')
    let dep = runner.tree.addFile(path.resolve('index.txt'))
    dep.contents = Buffer.from('Hello World')
    entry.addDependency(dep)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(dep.path)
      assert.strictEqual(file.contents.toString(), 'module.exports = \'Hello World\';')
    })
  })

  it('should also convert html files', function () {
    let runner = mako().use(str2js())
    let entry = runner.tree.addFile(path.resolve('index.js'))
    entry.contents = Buffer.from('module.exports = require("./index.html");')
    let dep = runner.tree.addFile(path.resolve('index.html'))
    dep.contents = Buffer.from('<p>Hello World</p>')
    entry.addDependency(dep)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(dep.path)
      assert.strictEqual(file.contents.toString(), 'module.exports = \'<p>Hello World</p>\';')
    })
  })

  it('should append the type instead of replacing', function () {
    let runner = mako().use(str2js())
    let entry = runner.tree.addFile(path.resolve('index.js'))
    entry.contents = Buffer.from('module.exports = require("./index.txt");')
    let dep = runner.tree.addFile(path.resolve('index.txt'))
    dep.contents = Buffer.from('Hello World')
    entry.addDependency(dep)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(dep.path)
      assert.strictEqual(file.basename, 'index.txt.js')
    })
  })

  it('should allow setting a custom list of extensions', function () {
    let runner = mako().use(str2js('foo'))
    let entry = runner.tree.addFile(path.resolve('index.js'))
    entry.contents = Buffer.from('module.exports = require("./index.txt");')
    let dep = runner.tree.addFile(path.resolve('index.foo'))
    dep.contents = Buffer.from('Hello World')
    entry.addDependency(dep)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(dep.path)
      assert.strictEqual(file.contents.toString(), 'module.exports = \'Hello World\';')
    })
  })

  it('should not convert files that are not depended on by js files', function () {
    let runner = mako().use(str2js())
    let entry = runner.tree.addFile(path.resolve('index.html'))
    entry.contents = Buffer.from('<p>Hello World</p>')

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(entry.path)
      assert.strictEqual(file.contents.toString(), '<p>Hello World</p>')
    })
  })
})
