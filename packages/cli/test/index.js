/* eslint-env mocha */

'use strict'

let cache = require('mako-cache')
let chai = require('chai')
let cp = require('child_process')
let fs = require('fs')
let path = require('path')
let rm = require('rimraf').sync

chai.use(require('chai-as-promised'))
let assert = chai.assert
let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('mako cli', function () {
  afterEach(function () {
    rm(fixture('*/build'))
  })

  afterEach(function () {
    return cache.clear()
  })

  it('should build a simple project', function () {
    return run('simple').then(() => {
      let file = fixture('simple/build/index.js')
      assert.isTrue(fs.existsSync(file))
    })
  })

  it('should not save a cached tree', function () {
    return run('simple').then(() => {
      let file = cache.path(fixture('simple'))
      assert.isFalse(fs.existsSync(file))
    })
  })

  it('should enable the cache', function () {
    return run('simple', '--cache').then(() => {
      let file = cache.path(fixture('simple'))
      assert.isTrue(fs.existsSync(file))
    })
  })

  it('should expand glob patterns in the config', function () {
    return run('entry-globs').then(() => {
      let files = [
        fixture('entry-globs/build/a.js'),
        fixture('entry-globs/build/b.js'),
        fixture('entry-globs/build/c.js')
      ]

      files.forEach(function (file) {
        assert.isTrue(fs.existsSync(file))
      })
    })
  })

  it('should only run for the entries specified as arguments', function () {
    return run('entry-globs', 'a.js').then(() => {
      let yes = [
        fixture('entry-globs/build/a.js')
      ]

      let no = [
        fixture('entry-globs/build/b.js'),
        fixture('entry-globs/build/c.js')
      ]

      yes.forEach(file => assert.isTrue(fs.existsSync(file)))
      no.forEach(file => assert.isFalse(fs.existsSync(file)))
    })
  })

  it('should allow passing config to plugins', function () {
    return run('plugin-config').then(() => {
      // config excludes write plugin, so output files should not be made
      let file = fixture('plugin-config/build/sub/index.js')
      assert.isTrue(fs.existsSync(file))
    })
  })

  it('should fail when config does not exist', function () {
    return assert.isRejected(run('alternate-config'))
  })

  it('should output errors to stderr', function () {
    return run('missing-config').catch(results => {
      assert.include(results.stderr, 'unable to load mako configuration')
    })
  })

  it('should allow loading config from package.json', function () {
    return run('package-config')
  })

  it('should log the entries before building', function () {
    return run('simple').then(results => {
      assert.include(results.stdout, 'building index.js')
      // FIXME: temporarily disable this assertion until node 7 deprecation warnings are addressed upstream
      // assert.lengthOf(results.stderr, 0)
    })
  })

  it('should log the files after building', function () {
    return run('simple').then(results => {
      assert.include(results.stdout, 'built build/index.js')
      // FIXME: temporarily disable this assertion until node 7 deprecation warnings are addressed upstream
      // assert.lengthOf(results.stderr, 0)
    })
  })
})

/**
 * Runs the given fixture through the CLI.
 *
 * @param {String} name   The fixture name.
 * @param {Array} [args]  Additional command arguments.
 * @return {Promise}
 */
function run (name, args) {
  return new Promise(function (resolve, reject) {
    let cmd = path.resolve(__dirname, '../bin/mako')
    if (args) cmd += ' ' + args
    let options = { cwd: fixture(name) }
    cp.exec(cmd, options, function (err, stdout, stderr) {
      if (err) {
        reject({ error: err, stdout: stdout, stderr: stderr })
      } else {
        resolve({ stdout: stdout, stderr: stderr })
      }
    })
  })
}
