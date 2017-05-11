/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let convert = require('convert-source-map')
let css = require('..')
let datauri = require('dataurify')
let deps = require('@dominicbarnes/cssdeps')
let fs = require('fs')
let mako = require('mako')
let path = require('path')

let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('css plugin', function () {
  it('should create a script that executes and returns the top-level export', function () {
    let entry = fixture('simple/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('simple'))
      })
  })

  it('should work with nested modules', function () {
    let entry = fixture('nested/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('nested'))
      })
  })

  it('should remove the dependencies from the tree', function () {
    let entry = fixture('nested/index.css')
    let nested = fixture('nested/lib/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        assert.isFalse(build.tree.hasFile(nested))
      })
  })

  it('should work with installed modules', function () {
    let entry = fixture('modules/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('modules'))
      })
  })

  it('should properly resolve css even when modules specify a main js', function () {
    let entry = fixture('modules-with-js/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('modules-with-js'))
      })
  })

  it('should prefer a style definition in the package.json', function () {
    let entry = fixture('modules-with-style/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('modules-with-style'))
      })
  })

  it('should find assets linked to the entry file', function () {
    let entry = fixture('assets/index.css')
    let asset = fixture('assets/texture.png')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let assetFile = build.tree.findFile(asset)
        assert.isDefined(entryFile)
        assert.isDefined(assetFile)
        assert.isTrue(entryFile.hasDependency(assetFile))
      })
  })

  it('should find assets with query parameters', function () {
    let entry = fixture('assets-query/index.css')
    let asset = fixture('assets-query/texture.png')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let assetFile = build.tree.findFile(asset)
        assert.isDefined(entryFile)
        assert.isDefined(assetFile)
        assert.isTrue(entryFile.hasDependency(assetFile))
      })
  })

  it('should find assets in multiple backgrounds', function () {
    let entry = fixture('assets-multi/index.css')
    let asset1 = fixture('assets-multi/texture1.png')
    let asset2 = fixture('assets-multi/texture2.png')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let asset1File = build.tree.findFile(asset1)
        let asset2File = build.tree.findFile(asset2)
        assert.isDefined(entryFile)
        assert.isDefined(asset1File)
        assert.isDefined(asset2File)
        assert.isTrue(entryFile.hasDependency(asset1File))
        assert.isTrue(entryFile.hasDependency(asset2File))
      })
  })

  it('should find assets linked to the entry file', function () {
    let entry = fixture('assets-custom-syntax/index.css')
    let asset = fixture('assets-custom-syntax/texture.png')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let assetFile = build.tree.findFile(asset)
        assert.isDefined(entryFile)
        assert.isDefined(assetFile)
        assert.isTrue(entryFile.hasDependency(assetFile))
      })
  })

  it('should move assets to the entry file', function () {
    let entry = fixture('nested-assets/index.css')
    let asset = fixture('nested-assets/lib/texture.png')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let assetFile = build.tree.findFile(asset)
        assert.isDefined(entryFile)
        assert.isDefined(assetFile)
        assert.isTrue(entryFile.hasDependency(assetFile))
      })
  })

  it('should inline all assets', function () {
    let entry = fixture('assets-inline/index.css')
    let texture = fixture('assets-inline/texture.png')
    let logo = fixture('assets-inline/logo.png')

    return mako()
      .use(plugins({ inline: true }))
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let textureFile = build.tree.findFile(texture)
        let logoFile = build.tree.findFile(logo)
        assert.isDefined(entryFile)
        assert.isUndefined(textureFile)
        assert.isUndefined(logoFile)
        assert.isFalse(entryFile.hasDependency(textureFile))
        assert.isFalse(entryFile.hasDependency(logoFile))
        assert.include(entryFile.contents.toString(), datauri(read(texture)))
        assert.include(entryFile.contents.toString(), datauri(read(logo)))
      })
  })

  it('should only inline assets smaller than the configured number of bytes', function () {
    let entry = fixture('assets-inline/index.css')
    let texture = fixture('assets-inline/texture.png')
    let logo = fixture('assets-inline/logo.png')

    return mako()
      .use(plugins({ inline: 2048 }))
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let textureFile = build.tree.findFile(texture)
        let logoFile = build.tree.findFile(logo)
        assert.isDefined(entryFile)
        assert.isDefined(textureFile)
        assert.isUndefined(logoFile)
        assert.isTrue(entryFile.hasDependency(textureFile))
        assert.isFalse(entryFile.hasDependency(logoFile))
        assert.notInclude(entryFile.contents.toString(), datauri(read(texture)))
        assert.include(entryFile.contents.toString(), datauri(read(logo)))
      })
  })

  it('should only inline assets that pass the function test', function () {
    let entry = fixture('assets-inline/index.css')
    let texture = fixture('assets-inline/texture.png')
    let logo = fixture('assets-inline/logo.png')

    return mako()
      .use(plugins({
        inline (file) {
          return Buffer.byteLength(file.contents) > 2048
        }
      }))
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let textureFile = build.tree.findFile(texture)
        let logoFile = build.tree.findFile(logo)
        assert.isDefined(entryFile)
        assert.isUndefined(textureFile)
        assert.isDefined(logoFile)
        assert.isFalse(entryFile.hasDependency(textureFile))
        assert.isTrue(entryFile.hasDependency(logoFile))
        assert.include(entryFile.contents.toString(), datauri(read(texture)))
        assert.notInclude(entryFile.contents.toString(), datauri(read(logo)))
      })
  })

  it('should inline none of the assets', function () {
    let entry = fixture('assets-inline/index.css')
    let texture = fixture('assets-inline/texture.png')
    let logo = fixture('assets-inline/logo.png')

    return mako()
      .use(plugins({ inline: null }))
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        let textureFile = build.tree.findFile(texture)
        let logoFile = build.tree.findFile(logo)
        assert.isDefined(entryFile)
        assert.isDefined(textureFile)
        assert.isDefined(logoFile)
        assert.isTrue(entryFile.hasDependency(textureFile))
        assert.isTrue(entryFile.hasDependency(logoFile))
      })
  })

  it('should rewrite asset urls relative to the entry', function () {
    let entry = fixture('nested-assets/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        let path = deps(file.contents.toString())[0]
        assert.equal(path, 'lib/texture.png')
      })
  })

  it('should rewrite asset urls correctly even in separate directories', function () {
    let entry = fixture('deep-assets/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('deep-assets'))
      })
  })

  it('should rewrite dependency asset urls relative to the entry file', function () {
    let entry = fixture('dependency-assets/index.css')

    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('dependency-assets'))
      })
  })

  it('should ignore absolute urls', function () {
    let entry = fixture('http/index.css')
    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('http'))
      })
  })

  it('should ignore imports of absolute urls', function () {
    let entry = fixture('import-http/index.css')
    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('import-http'))
      })
  })

  it('should ignore data-uris', function () {
    let entry = fixture('datauri/index.css')
    return mako()
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(entry)
        assert.strictEqual(file.contents.toString().trim(), expected('datauri'))
      })
  })

  it('should build from entries that are not CSS', function () {
    let entry = fixture('subentries/index.txt')
    let css = fixture('subentries/index.css')

    return mako()
      .use(buffer([ 'txt' ]))
      .dependencies('txt', function parseText (file, build) {
        let depPath = path.resolve(path.dirname(file.path), file.contents.toString().trim())
        let depFile = build.tree.addFile(depPath)
        file.addDependency(depFile)
      })
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let file = build.tree.findFile(css)
        assert.strictEqual(file.contents.toString().trim(), expected('subentries'))
      })
  })

  it('should include the filename during parse errors', function () {
    let root = fixture('syntax-error')
    let entry = fixture('syntax-error/index.css')

    return mako({ root })
      .use(plugins())
      .build(entry)
      .catch(function (err) {
        assert.include(err.message, 'index.css')
      })
  })

  it('should fix when root is different than CWD (fixes: #74)', () => {
    let root = fixture('assets')
    let entry = fixture('assets/index.css')

    return mako({ root })
      .use(plugins())
      .build(entry)
      .then(function (build) {
        let entryFile = build.tree.findFile(entry)
        assert.equal(entryFile.contents.toString(), 'html {\n  background-color: #338c00;\n  background-image: url("texture.png");\n}')
      })
  })

  context('with options', function () {
    context('.extensions', function () {
      it('should be able to resolve all the specified extensions', function () {
        let entry = fixture('extensions/index.css')
        return mako()
          .use(buffer('less'))
          .postread('less', file => { file.type = 'css' })
          .use(plugins({ extensions: [ '.less' ] }))
          .build(entry)
          .then(function (build) {
            let file = build.tree.findFile(entry)
            assert.strictEqual(file.contents.toString().trim(), expected('extensions'))
          })
      })

      it('should be able to flatten the specified list', function () {
        let entry = fixture('extensions/index.css')
        return mako()
          .use(buffer('less'))
          .postread('less', file => { file.type = 'css' })
          .use(plugins({ extensions: '.less' }))
          .build(entry)
          .then(function (build) {
            let file = build.tree.findFile(entry)
            assert.strictEqual(file.contents.toString().trim(), expected('extensions'))
          })
      })
    })

    context('.resolveOptions', function () {
      it('should set config for resolve', function () {
        let entry = fixture('modules-alt-dir/index.css')

        return mako()
          .use(plugins({ resolveOptions: { moduleDirectory: 'npm' } }))
          .build(entry)
          .then(function (build) {
            let file = build.tree.findFile(entry)
            assert.strictEqual(file.contents.toString().trim(), expected('modules-alt-dir'))
          })
      })
    })

    context('.sourceMaps', function () {
      it('should generate file.sourcemap', function () {
        let entry = fixture('source-maps-inline/index.css')

        return mako()
          .use(plugins({ sourceMaps: true }))
          .build(entry)
          .then(function (build) {
            let file = build.tree.findFile(entry)
            assert(convert.fromObject(file.sourcemap), 'expected valid source-map object')
          })
      })
    })
  })
})

/**
 * Helper for getting plugins used during tests.
 *
 * @param {Object} [options]  Plugin configuration.
 * @return {Array}
 */
function plugins (options) {
  return [
    buffer([ 'css', 'png' ]),
    css(options)
  ]
}

/**
 * Read fixture
 *
 * @param  {path} path file path
 * @return {String}
 */
function read (path) {
  return fs.readFileSync(path)
}

/**
 * Read the expected
 *
 * @param {String} name   The fixture directory name
 * @param {String} [ext]  The fixture file extension (default: 'css')
 * @return {String}
 */
function expected (name, ext) {
  return read(fixture(name, `expected.${ext || 'css'}`)).toString().trim()
}

/**
 * Read files from disk.
 *
 * @param {Array} extensions  List of extensions to process.
 * @return {Function} plugin
 */
function buffer (extensions) {
  return function (mako) {
    mako.read(extensions, function (file, build, done) {
      fs.readFile(file.path, function (err, buf) {
        if (err) return done(err)
        file.contents = buf
        done()
      })
    })
  }
}
