/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let convert = require('convert-source-map')
let mako = require('mako')
let path = require('path')
let sourcemaps = require('..')

const js = {
  version: 3,
  file: 'foo.js',
  sources: [ 'console.log("hi");' ],
  names: [],
  mappings: 'AAAA',
  sourceRoot: '/'
}

const css = {
  version: 3,
  file: 'foo.css',
  sources: [ 'body {\n  background-color: blue;\n}' ],
  names: [],
  mappings: 'AAAA',
  sourceRoot: '/'
}

describe('sourcemaps plugin', function () {
  context('external', function () {
    it('should add an external map file to the tree', function () {
      let runner = mako().use(sourcemaps('js'))
      let file = runner.tree.addFile(path.resolve('foo.js'))
      file.contents = Buffer.from('console.log("hello world");')
      file.sourceMap = js

      return runner.build(file.path).then(function (build) {
        let entry = build.tree.findFile(file.path)
        let map = build.tree.findFile(`${file.path}.map`)
        assert.deepEqual(entry.sourceMap, JSON.parse(map.contents.toString()))
      })
    })

    it('should link to the external file in the source file', function () {
      let runner = mako().use(sourcemaps('js'))
      let file = runner.tree.addFile(path.resolve('foo.js'))
      file.contents = Buffer.from('console.log("hello world");')
      file.sourceMap = js

      return runner.build(file.path).then(function (build) {
        let entry = build.tree.findFile(file.path)
        assert.strictEqual(entry.contents.toString().match(convert.mapFileCommentRegex).shift(), '//# sourceMappingURL=foo.js.map')
      })
    })

    it('should use the right syntax for external CSS source maps', function () {
      let runner = mako().use(sourcemaps('css'))
      let file = runner.tree.addFile(path.resolve('foo.css'))
      file.contents = Buffer.from('body {\n  background-color: blue;\n}')
      file.sourceMap = css

      return runner.build(file.path).then(function (build) {
        let entry = build.tree.findFile(build.entries[0])
        assert.strictEqual(entry.contents.toString().match(convert.mapFileCommentRegex).shift(), '/*# sourceMappingURL=foo.css.map */')
      })
    })
  })

  context('inline', function () {
    it('should write the source map as an inline comment', function () {
      let runner = mako().use(sourcemaps('js', { inline: true }))
      let file = runner.tree.addFile(path.resolve('foo.js'))
      file.contents = Buffer.from('console.log("hello world");')
      file.sourceMap = js

      return runner.build(file.path).then(function (build) {
        let entry = build.tree.findFile(file.path)
        let map = convert.fromComment(entry.contents.toString()).toObject()
        assert.deepEqual(map, entry.sourceMap)
        assert.match(entry.contents, /\/\/# sourceMappingURL=\S+/)
      })
    })

    it('should use the right syntax for inline CSS source maps', function () {
      let runner = mako().use(sourcemaps('css', { inline: true }))
      let file = runner.tree.addFile(path.resolve('foo.css'))
      file.contents = Buffer.from('console.log("hello world");')
      file.sourceMap = css

      return runner.build(file.path).then(function (build) {
        let entry = build.tree.findFile(file.path)
        let map = convert.fromComment(entry.contents.toString()).toObject()
        assert.deepEqual(map, entry.sourceMap)
        assert.match(entry.contents, /\/\*# sourceMappingURL=\S+ \*\//)
      })
    })

    it('should include spaces in json output', function () {
      let runner = mako().use(sourcemaps('js', { spaces: 2 }))
      let file = runner.tree.addFile(path.resolve('foo.js'))
      file.contents = Buffer.from('console.log("hello world");')
      file.sourceMap = js

      return runner.build(file.path).then(function (build) {
        let entry = build.tree.findFile(file.path)
        let map = build.tree.findFile(`${entry.path}.map`)
        assert.strictEqual(map.contents.toString(), convert.fromObject(entry.sourceMap).toJSON(2))
      })
    })
  })
})
