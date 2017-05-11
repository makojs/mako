/* eslint-env mocha */

'use strict'

let chai = require('chai')
let mako = require('mako')
let path = require('path')
let rm = require('rimraf').sync
let staticSite = require('..')

chai.use(require('chai-as-promised'))
let assert = chai.assert
let fixture = path.resolve.bind(path, __dirname, 'fixtures')

afterEach(function () {
  rm(fixture('**/build'))
})

describe('static-site plugin bundle', function () {
  it('should convert md files into html', function () {
    let root = fixture('simple')
    let index = fixture('simple/index.md')
    let post = fixture('simple/posts/first-post.md')
    let runner = mako({ root: root }).use(staticSite())

    return runner.build([ index, post ]).then(function (build) {
      let indexFile = build.tree.findFile(index)
      assert.strictEqual(indexFile.path, fixture('simple/build/index.html'))
      assert.include(indexFile.contents.toString(), '<h2>Read what I have to say</h2>')

      let postFile = build.tree.findFile(post)
      assert.strictEqual(postFile.path, fixture('simple/build/posts/first-post.html'))
      assert.include(postFile.contents.toString(), '<h1>My First Post</h1>')
    })
  })

  it('should inject the main content into a layout', function () {
    let root = fixture('simple')
    let index = fixture('simple/index.md')
    let post = fixture('simple/posts/first-post.md')
    let runner = mako({ root: root }).use(staticSite())

    return runner.build([ index, post ]).then(function (build) {
      let indexFile = build.tree.findFile(index)
      assert.include(indexFile.contents.toString(), '<!DOCTYPE html>')
      assert.include(indexFile.contents.toString(), 'Read what I have to say')

      let postFile = build.tree.findFile(post)
      assert.include(postFile.contents.toString(), '<!DOCTYPE html>')
      assert.include(postFile.contents.toString(), 'An interesting post')
    })
  })

  it('should not output the layout files during compile', function () {
    let root = fixture('simple')
    let index = fixture('simple/index.md')
    let runner = mako({ root: root }).use(staticSite())

    return runner.build([ index ]).then(function (build) {
      assert.isFalse(build.tree.hasFile(fixture('simple/layouts/layout.html')))
    })
  })
})
