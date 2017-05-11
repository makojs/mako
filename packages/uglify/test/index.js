/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let mako = require('mako')
let path = require('path')
let uglify = require('..')

const sourceMap = {
  version: 3,
  file: 'foo.js',
  sources: [ 'console.log("hi");' ],
  names: [],
  mappings: 'AAAA',
  sourceRoot: '/'
}

describe('uglify plugin', function () {
  it('should minify the file', function () {
    let runner = mako().use(uglify())
    let entry = runner.tree.addFile(path.resolve('index.js'))
    entry.contents = new Buffer('\n\nvar a = 2 + 2;\n\n')

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(entry.path)
      assert.notInclude(file.contents.toString(), '\n') // uglify should remove all the newlines
    })
  })

  it('should make sure the file path is part of the error message', function () {
    let runner = mako().use(uglify())
    let entry = runner.tree.addFile(path.resolve('error/index.js'))
    entry.contents = new Buffer('foo(; // intentional syntax error')

    return runner.build(entry.path).catch(function (err) {
      assert.include(err.message, 'error/index.js')
    })
  })

  it('should modify file.sourceMap', function () {
    let runner = mako().use(uglify())
    let entry = runner.tree.addFile(path.resolve('foo.js'))
    entry.contents = new Buffer('var a = 1 + 2 + 3')
    entry.sourceMap = sourceMap

    return runner.build(entry.path).then(function (build) {
      let file = build.tree.findFile(entry.path)
      assert.notDeepEqual(file.sourceMap, sourceMap)
    })
  })
})
