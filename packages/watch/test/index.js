/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let path = require('path')
let touch = require('touch')
let Tree = require('mako-tree')
let Watcher = require('..')

const fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('watch plugin', function () {
  it('should emit a ready event', function (done) {
    let root = fixture('simple')
    let tree = new Tree(root)
    let watcher = new Watcher(tree)

    watcher.on('ready', () => done())
  })

  it('should emit a change event when a file is modified', function (done) {
    let root = fixture('simple')
    let entry = path.join(root, 'index.js')
    let tree = new Tree(root)
    let file = tree.addFile(entry)
    let watcher = new Watcher(tree)

    watcher.on('change', (fileArg, treeArg) => {
      assert.strictEqual(file, fileArg)
      assert.strictEqual(tree, treeArg)
      done()
    })

    // trigger a change (after the watcher is ready)
    watcher.on('ready', () => touch(entry, { nocreate: true }))
  })
})
