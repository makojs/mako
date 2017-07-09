/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let fs = require('fs')
let path = require('path')
let rm = require('rimraf')
let touch = require('touch')
let Tree = require('mako-tree')
let Watcher = require('..')

const fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('watch plugin', function () {
  after(function (done) {
    rm(fixture('{add,remove}/*.txt'), done)
  })

  it('should emit a ready event', function (done) {
    let root = fixture('simple')
    let tree = new Tree(root)
    let watcher = new Watcher(tree)

    watcher.on('ready', () => done())
  })

  context('change', function () {
    it('should emit when a file is modified', function (done) {
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

  context('add', function () {
    let watcher

    let root = fixture('add')
    let entry = path.join(root, '1.txt')
    let tree = new Tree(root)

    before(function (done) {
      watcher = new Watcher(tree)
      watcher.on('ready', done)
    })

    beforeEach(function (done) {
      rm.sync(entry)
      setTimeout(done, 100)
    })

    after(function () {
      watcher.unwatch()
    })

    it('should emit when a file is created', function (done) {
      watcher.once('add', (fileArg, treeArg) => {
        assert.strictEqual(entry, fileArg)
        assert.strictEqual(tree, treeArg)
        done()
      })

      // create this file so an event will be emitted
      touch.sync(entry)
    })
  })

  context('remove', function () {
    let watcher

    let root = fixture('remove')
    let tree = new Tree(root)
    tree.addFile(fixture('remove/1.txt'))

    before(function (done) {
      watcher = new Watcher(tree)
      watcher.on('ready', done)
    })

    beforeEach(function (done) {
      fs.writeFileSync(fixture('remove/1.txt'), '')
      fs.writeFileSync(fixture('remove/2.txt'), '')
      setTimeout(done, 100)
    })

    after(function () {
      watcher.unwatch()
    })

    it('should emit when a file in the tree is deleted', function (done) {
      let file = fixture('remove/1.txt')

      watcher.once('remove', (fileArg, treeArg) => {
        assert.strictEqual(file, fileArg)
        assert.strictEqual(tree, treeArg)
        done()
      })

      rm.sync(file)
    })

    it('should not emit when the file is not in the tree', function (done) {
      let file = fixture('remove/2.txt')

      watcher.once('remove', (fileArg, treeArg) => {
        done(new Error('should not be called'))
      })

      // if a second goes by without the event, we'll consider this test a pass
      setTimeout(done, 1000)

      rm.sync(file)
    })
  })
})
