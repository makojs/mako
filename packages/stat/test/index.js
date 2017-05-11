/* eslint-env mocha */

'use strict'

let chai = require('chai')
let mako = require('mako')
let path = require('path')
let stat = require('..')
let touch = require('touch').sync

chai.use(require('chai-as-promised'))
let assert = chai.assert
let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('stat plugin', function () {
  it('should add the stat object for the input file', function () {
    let entry = fixture('simple/index.js')

    return mako()
      .use(stat('js'))
      .parse(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert(file.stat)
      })
  })

  it('should always use initialPath', function () {
    let entry = fixture('simple/index.js')
    let runner = mako().use(plugin('js'), stat('js'))

    return runner.parse(entry)

    function plugin (extensions) {
      return function (mako) {
        mako.preread(extensions, (file) => {
          file.type = 'txt'
        })
      }
    }
  })

  it('should fail when the file does not exist', function () {
    return assert.isRejected(mako().use(stat('js')).parse(fixture('does-not-exist.js')))
  })

  it('should parse the file again if the mtime has changed', function () {
    let entry = fixture('simple/index.js')
    let processed = []

    let builder = mako().use(stat('js'))

    builder.read('js', function (file) {
      processed.push(file.path)
    })

    return builder.parse(entry)
      .then(() => touch(entry))
      .then(() => builder.parse(entry))
      .then(() => assert.deepEqual(processed, [ entry, entry ]))
  })

  it('should not re-parse the file again if the mtime has not changed', function () {
    let processed = []
    let entry = fixture('simple/index.js')
    let builder = mako().use(stat('js'))

    builder.read('js', file => processed.push(file.path))

    return builder.parse(entry)
      .then(() => builder.parse(entry))
      .then(() => assert.deepEqual(processed, [ entry ]))
  })
})
