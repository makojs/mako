/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let copy = require('..')
let fs = require('fs')
let mako = require('mako')
let path = require('path')
let rm = require('rimraf')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('copy plugin', function () {
  afterEach(function (done) {
    rm(fixture('**/build'), done)
  })

  it('should copy the input file to the output location', function () {
    let entry = fixture('simple/index.txt')

    return mako({ root: fixture('simple') })
      .use(output('txt'))
      .use(copy('txt'))
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.isTrue(fs.existsSync(file.initialPath))
        let actual = fs.readFileSync(file.initialPath, 'utf8')
        let expected = fs.readFileSync(file.initialPath, 'utf8')
        assert.strictEqual(actual, expected)
      })
  })

  it('should not copy when the input file has not changed', function () {
    let entry = fixture('simple/index.txt')
    let runner = mako({ root: fixture('simple') })
      .use(stat('txt'))
      .use(output('txt'))
      .use(copy('txt'))

    return runner.build(entry).then(function (build) {
      let file = build.tree.findFile(entry)
      let a = fs.statSync(file.path).mtime

      // need to delay because the mtime is measured in sec, not msec
      return delay(1000).then(function () {
        return runner.build(entry).then(function () {
          let b = fs.statSync(file.path).mtime
          assert.strictEqual(a.getTime(), b.getTime())
        })
      })
    })
  })

  it('should always copy when file has not been stat', function () {
    let entry = fixture('simple/index.txt')
    let runner = mako({ root: fixture('simple') })
      .use(output('txt'))
      .use(copy('txt'))

    return runner.build(entry).then(function (build) {
      let file = build.tree.findFile(entry)
      let a = fs.statSync(file.path).mtime

      // need to delay because the mtime is measured in sec, not msec
      return delay(1000).then(function () {
        return runner.build(entry).then(function () {
          let b = fs.statSync(file.path).mtime
          assert.notStrictEqual(a.getTime(), b.getTime())
        })
      })
    })
  })

  context('with options', function () {
    context('.force', function () {
      it('should always copy', function () {
        let entry = fixture('simple/index.txt')
        let runner = mako({ root: fixture('simple') })
          .use(stat('txt'))
          .use(output('txt'))
          .use(copy('txt', { force: true }))

        return runner.build(entry).then(function (build) {
          let file = build.tree.findFile(entry)
          let a = fs.statSync(file.path).mtime
          runner.dirty(file)

          // need to delay because the mtime is measured in sec, not msec
          return delay(1000).then(function () {
            return runner.build(entry).then(function () {
              let b = fs.statSync(file.path).mtime
              assert.notStrictEqual(a.getTime(), b.getTime())
            })
          })
        })
      })
    })
  })
})

function stat (extensions) {
  return function (mako) {
    mako.preread(extensions, function stat (file) {
      file.stat = fs.statSync(file.path)
    })
  }
}

function output (extensions) {
  return function (mako) {
    mako.prewrite(extensions, function output (file) {
      file.path = path.resolve(file.base, 'build', file.relative)
    })
  }
}

function delay (ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}
