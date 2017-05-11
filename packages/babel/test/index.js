/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let babel = require('..')
let convert = require('convert-source-map')
let mako = require('mako')
let path = require('path')
let vm = require('vm')

describe('babel plugin', function () {
  it('should transpile the file', function () {
    let runner = mako().use(babel({ plugins: [ 'transform-es2015-modules-commonjs' ] }))
    let entry = runner.tree.addFile(path.resolve('index.js'))
    entry.contents = new Buffer('export var a = 1;')

    return runner.parse(entry.path).then(function (build) {
      let file = build.tree.findFile(entry.path)
      assert.deepEqual(exec(file), { a: 1 })
    })
  })

  it('should ignore node_modules by default', function () {
    let runner = mako().use(babel({ plugins: [ 'transform-es2015-modules-commonjs' ] }))
    let entry = runner.tree.addFile(path.resolve('index.js'))
    entry.contents = new Buffer('export var a = 1;')
    let dep = runner.tree.addFile(path.resolve('node_modules/sum/index.js'))
    dep.contents = new Buffer('export default function (a, b) { return a + b; }')
    entry.addDependency(dep)

    return runner.parse(entry.path).then(function (build) {
      // since the node_module was not complied, it should have a syntax error
      let file = build.tree.findFile(dep.path)
      assert.throws(() => exec(file))
    })
  })

  context('with options', function () {
    context('.extensions', function () {
      it('should convert other file types into js', function () {
        let runner = mako().use(babel({ extensions: 'es', plugins: [ 'transform-es2015-modules-commonjs' ] }))
        let entry = runner.tree.addFile(path.resolve('index.es'))
        entry.contents = new Buffer('export var a = 1;')

        return runner.parse(entry.path).then(function (build) {
          let file = build.tree.findFile(entry.path)
          assert.strictEqual(file.type, 'js')
        })
      })
    })

    context('.sourceMaps', function () {
      it('should include an inline source-map', function () {
        let runner = mako().use(babel({ sourceMaps: true, plugins: [ 'transform-es2015-modules-commonjs' ] }))
        let entry = runner.tree.addFile(path.resolve('index.js'))
        entry.contents = new Buffer('export var a = 1;')

        return runner.parse(entry.path).then(function (build) {
          let file = build.tree.findFile(entry.path)
          assert.isTrue(convert.commentRegex.test(file.contents))
        })
      })
    })
  })
})

/**
 * Execute the JS string in a new context
 *
 * @param  {String} file  The build file to execute.
 * @return {Mixed} value
 */
function exec (file) {
  let exports = {}
  let module = { exports: exports }
  return vm.runInNewContext(file.contents, { module: module, exports: exports })
}
