/* eslint-env mocha */

'use strict'

const chai = require('chai')
const mako = require('mako')
const path = require('path')
const stylus = require('..')

chai.use(require('chai-as-promised'))
let assert = chai.assert

let src = 'bgColor = #fff\n.foo\n\tbackground: bgColor'
let result = '.foo {\n  background: #fff;\n}\n'
let srcMap = {
  version: 3,
  sources: [ 'index.styl' ],
  names: [],
  mappings: 'AACA;EACC,YAAY,KAAZ',
  file: 'index.css',
  sourceRoot: 'mako://'
}

describe('stylus plugin', function () {
  it('should change file type to css', function () {
    let runner = mako().use(stylus())
    let entry = runner.tree.addFile(path.resolve('index.styl'))
    entry.contents = new Buffer(src)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(path.resolve('index.styl'))
      assert.strictEqual(file.type, 'css')
    })
  })

  it('should throw an error for empty files', function () {
    let runner = mako().use(stylus())
    let entry = runner.tree.addFile(path.resolve('index.styl'))

    return assert.isRejected(runner.build(entry.path))
  })

  it('should convert .styl into .css', function () {
    let runner = mako().use(stylus())
    let entry = runner.tree.addFile(path.resolve('index.styl'))
    entry.contents = new Buffer(src)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(path.resolve('index.styl'))
      assert.strictEqual(file.type, 'css')
      assert.strictEqual(file.contents.toString(), result)
    })
  })

  it('should convert custom extension into .css', function () {
    let runner = mako().use(stylus({
      extensions: 'custom'
    }))
    let entry = runner.tree.addFile(path.resolve('index.custom'))
    entry.contents = new Buffer(src)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(path.resolve('index.custom'))
      assert.strictEqual(file.type, 'css')
      assert.strictEqual(file.contents.toString(), result)
    })
  })

  it('should add sourceMap', function () {
    let runner = mako().use(stylus({
      sourceMaps: true
    }))
    let entry = runner.tree.addFile(path.resolve('index.styl'))
    entry.contents = new Buffer(src)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(path.resolve('index.styl'))
      assert.strictEqual(file.type, 'css')
      assert.strictEqual(file.contents.toString(), result)
      assert.deepEqual(file.sourceMap, srcMap)
    })
  })

  it('should set sourceRoot', function () {
    let runner = mako().use(stylus({
      sourceMaps: true,
      sourceRoot: 'other://'
    }))
    let entry = runner.tree.addFile(path.resolve('index.styl'))
    entry.contents = new Buffer(src)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(path.resolve('index.styl'))
      assert.strictEqual(file.type, 'css')
      assert.strictEqual(file.contents.toString(), result)
      assert.deepEqual(file.sourceMap, Object.assign({}, srcMap, {sourceRoot: 'other://'}))
    })
  })

  it('should use stylus plugin passed directly as a function', function () {
    let a = function (style) {
      style.define('a', 10)
    }
    let src = '.foo\n\ttop: a'
    let result = '.foo {\n  top: 10;\n}\n'
    let runner = mako().use(stylus({
      plugins: a
    }))
    let entry = runner.tree.addFile(path.resolve('index.styl'))
    entry.contents = new Buffer(src)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(path.resolve('index.styl'))
      assert.strictEqual(file.type, 'css')
      assert.strictEqual(file.contents.toString(), result)
    })
  })

  it('should use multiple stylus plugins passed as an array', function () {
    let a = function (style) {
      style.define('a', 10)
    }
    let b = function (style) {
      style.define('b', 20)
    }
    let src = '.foo\n\tmargin: a b'
    let result = '.foo {\n  margin: 10 20;\n}\n'
    let runner = mako().use(stylus({
      plugins: [a, b]
    }))
    let entry = runner.tree.addFile(path.resolve('index.styl'))
    entry.contents = new Buffer(src)

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(path.resolve('index.styl'))
      assert.strictEqual(file.type, 'css')
      assert.strictEqual(file.contents.toString(), result)
    })
  })
})
