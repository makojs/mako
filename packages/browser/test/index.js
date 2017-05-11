/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let browser = require('..')
let fs = require('fs')
let mako = require('mako')
let path = require('path')
let rm = require('rimraf').sync
let vm = require('vm')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

afterEach(function () {
  rm(fixture('**/build'))
})

describe('browser plugin', function () {
  it('should build a simple project', function () {
    let root = fixture('simple')
    let js = fixture('simple/index.js')
    let css = fixture('simple/index.css')
    let builder = mako({ root }).use(browser())

    return builder.build(js, css).then(function (build) {
      let jsFile = build.tree.findFile(js)
      // js file execs and returns the right value
      assert.strictEqual(exec(jsFile), true)
      // output location is what we expected
      assert.strictEqual(jsFile.path, fixture('simple/build/index.js'))

      let cssFile = build.tree.findFile(css)
      // css file at least contains a substring we expect (not super-reliable)
      assert.include(cssFile.contents.toString(), 'background-color: green;')
      // output location is what we expected
      assert.strictEqual(cssFile.path, fixture('simple/build/index.css'))
    })
  })

  it('should build a project with nested imports', function () {
    let root = fixture('nested')
    let js = fixture('nested/index.js')
    let css = fixture('nested/index.css')
    let builder = mako({ root }).use(browser())

    return builder.build(js, css).then(function (build) {
      let jsFile = build.tree.findFile(js)
      // js file execs and returns the right value
      assert.strictEqual(exec(jsFile), 4)

      let cssFile = build.tree.findFile(css)
      // css file at least contains a substring we expect (not super-reliable)
      assert.include(cssFile.contents.toString(), 'text-decoration: underline;') // from index.css
      assert.include(cssFile.contents.toString(), 'box-sizing: border-box;') // from base.css
    })
  })

  it('should build a project with 3rd-party imports', function () {
    let root = fixture('vendor')
    let js = fixture('vendor/index.js')
    let css = fixture('vendor/index.css')
    let builder = mako({ root }).use(browser())

    return builder.build(js, css).then(function (build) {
      let jsFile = build.tree.findFile(js)
      // js file execs and returns the right value
      assert.deepEqual(exec(jsFile), [ 'a', 'a', 'a' ])

      let cssFile = build.tree.findFile(css)
      // css file at least contains a substring we expect (not super-reliable)
      assert.include(cssFile.contents.toString(), 'normalize.css v3.0.3')
    })
  })

  it('should copy linked assets to the output directory', function () {
    let root = fixture('assets')
    let css = fixture('assets/index.css')
    let image = fixture('assets/logo.png')
    let builder = mako({ root }).use(browser())

    return builder.build(css).then(function (build) {
      let file = build.tree.findFile(image)
      assert.strictEqual(file.path, fixture('assets/build/logo.png'))
      assert.isTrue(fs.existsSync(file.path))
    })
  })

  context('with options', function () {
    describe('.sourceMaps', function () {
      it('should output a source map file in the correct location', function () {
        let root = fixture('simple')
        let js = fixture('simple/index.js')
        let css = fixture('simple/index.css')
        let builder = mako({ root }).use(browser({ sourceMaps: true }))

        return builder.build(js, css).then(function (build) {
          assert(!!build.tree.findFile(fixture('simple/build/index.js.map')), 'expected to find a js source map')
          assert(!!build.tree.findFile(fixture('simple/build/index.css.map')), 'expected to find a css source map')
        })
      })
    })
  })
})

/**
 * Executes the given code, returning it's return value.
 *
 * @param {String} code  The source code to run. (ie: the result of a build)
 * @return {*}
 */
function exec (file) {
  const id = path.relative(file.base, file.initialPath)
  return vm.runInNewContext(file.contents)(id)
}
