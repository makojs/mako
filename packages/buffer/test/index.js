/* eslint-env mocha */

'use strict'

let buffer = require('..')
let chai = require('chai')
let fs = require('fs')
let mako = require('mako')
let path = require('path')

chai.use(require('chai-as-promised'))
let assert = chai.assert
let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('buffer plugin', function () {
  it('should add the file contents as a Buffer', function () {
    let entry = fixture('simple/index.js')
    let runner = mako().use(buffer('js'))

    runner.read('js', function (file) {
      assert.instanceOf(file.contents, Buffer)
      assert.strictEqual(file.contents.toString(), fs.readFileSync(entry, 'utf8'))
    })

    return runner.parse(entry)
  })

  it('should not clobber predefined contents', function () {
    let entry = fixture('simple/index.js')
    let runner = mako().use(buffer('js'))

    runner.read('js', function (file) {
      assert.instanceOf(file.contents, Buffer)
      assert.strictEqual(file.contents.toString(), 'hello world')
    })

    return runner.parse({ contents: new Buffer('hello world'), path: entry })
  })

  it('should propagate errors', function () {
    let entry = fixture('does-not-exist/index.js')
    let runner = mako().use(buffer('js'))

    return assert.isRejected(runner.parse(entry))
  })
})
