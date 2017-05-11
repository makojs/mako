
'use strict'

let bpack = require('browser-pack')
let bresolve = require('browser-resolve')
let builtins = require('./lib/builtins')
let concat = require('concat-stream')
let convert = require('convert-source-map')
let debug = require('debug')('mako-js')
let detective = require('detective')
let envify = require('loose-envify')
let flatten = require('array-flatten')
let insertGlobals = require('insert-module-globals')
let path = require('path')
let Promise = require('bluebird')
let pump = require('pump')
let readable = require('string-to-stream')
let resolve = require('resolve')
let sortBy = require('sort-by')
let streamify = require('stream-array')
let syntax = require('syntax-error')
let utils = require('mako-utils')
let values = require('object-values')

// default plugin configuration
const defaults = {
  browser: true,
  bundle: false,
  checkSyntax: true,
  core: null,
  detectiveOptions: null,
  extensions: [],
  modules: null,
  resolveOptions: null,
  sourceMaps: false,
  sourceRoot: 'file://mako'
}

/**
 * Initialize the mako js plugin.
 *
 * Available options:
 *  - bundle {String}          a path to a shared bundle file.
 *  - extensions {Array}       additional extensions to process.
 *  - resolveOptions {Object}  options for the resolve module.
 *  - sourceMaps {Boolean}     enable source maps.
 *  - sourceRoot {String}      source map root.
 *
 * @param {Object} options  Configuration.
 * @return {Function}
 */
module.exports = function (options) {
  debug('initialize %j', options)
  let config = Object.assign({}, defaults, options)

  return function (mako) {
    if (config.core) customCoreModules(config.core)
    mako.postread('json', json)
    if (config.checkSyntax) mako.predependencies('js', check)
    mako.dependencies('js', npm)
    if (config.bundle) mako.precompile(shared)
    mako.precompile(mapping)
    mako.postdependencies([ 'js', 'json' ], pack)
  }

  /**
   * Convert a JSON file into a valid JS function that can be inlined.
   *
   * @param {File} file  The current file being processed.
   */
  function json (file) {
    file.contents = Buffer.concat([
      new Buffer('module.exports = '),
      file.contents,
      new Buffer(';')
    ])
  }

  /**
   * Performs a syntax check on the source file before attempting to parse
   * dependencies. This will give a better error than simply dropping into
   * file-deps.
   *
   * @param {File} file    The current file being processed.
   * @param {Build} build  The current build.
   */
  function check (file, build) {
    var err = syntax(file.contents.toString(), file.path)
    if (err) throw err
  }

  /**
   * Mako dependencies hook that parses a JS file for `require` statements,
   * resolving them to absolute paths and adding them as dependencies.
   *
   * @param {File} file    The current file being processed.
   * @param {Build} build  The current build.
   */
  function * npm (file, build) {
    let resolver = config.browser ? bresolve : resolve

    // include node globals and environment variables
    file.contents = yield postprocess(file, config)

    file.deps = Object.create(null)
    let deps = detective(file.contents, config.detectiveOptions)
    debug('%d dependencies found for %s:', deps.length, utils.relative(file.path))
    deps.forEach(dep => debug('> %s', dep))

    // traverse dependencies
    yield Promise.map(deps, function (dep) {
      return Promise.fromCallback(function (done) {
        let options = Object.assign({}, config.resolveOptions, {
          filename: file.path,
          basedir: file.dirname,
          extensions: flatten([ '.js', '.json', config.extensions ]),
          modules: Object.assign({}, builtins, config.modules)
        })

        debug('resolving %s from %s', dep, utils.relative(file.path))
        resolver(dep, options, function (err, resolved) {
          if (err) return done(err)
          debug('resolved %s -> %s from %s', dep, utils.relative(resolved), utils.relative(file.path))
          if (!resolve.isCore(resolved)) {
            let depFile = build.tree.findFile(resolved)
            if (!depFile) depFile = build.tree.addFile(resolved)
            file.deps[dep] = relativeInitial(depFile)
            file.addDependency(depFile)
          }
          done()
        })
      })
    })
  }

  /**
   * Inspects each file in the tree to see if it is a candidate for adding to
   * the shared bundle.
   *
   * Currently, a file is considered shared if it imported by more than 1 file.
   * This threshold will eventually be configurable.
   *
   * When a file is determined to be shared, all of it's dependencies will also
   * be included implicitly.
   *
   * @param {Build} build  The current build.
   */
  function shared (build) {
    let tree = build.tree

    let files = tree.getFiles()
      .filter(file => file.type === 'js' || file.type === 'json')

    for (const file of files) {
      if (file.bundle) continue // short-circuit

      const degree = tree.graph.outDegree(file.id)
      if (degree <= 1) continue // not a candidate for bundling

      debug('shared by %d files: %s', degree, utils.relative(file.path))
      file.bundle = true

      for (const dependency of file.dependencies({ recursive: true })) {
        if (dependency.bundle) continue // already known

        debug('> %s', utils.relative(dependency.path))
        dependency.bundle = true
      }
    }
  }

  /**
   * This precompile plugin has the following responsibilities:
   *
   *  - generate browser-pack mappings for JS sub-trees
   *  - remove the dependencies from the tree so they are not iterated later
   *    by the cycle detector (which is an expensive operation)
   *  - when bundling is enabled
   *     - identify candidates for bundling
   *     - add shared bundle to dependency tree
   *
   * @param {Build} build  The current build.
   */
  function mapping (build) {
    const tree = build.tree
    const roots = tree.getFiles().filter(isRoot)
    const bundle = config.bundle ? Object.create(null) : null
    const deps = new Set()

    for (const root of roots) {
      debug('generating mapping for %s', utils.relative(root.path))
      const mapping = Object.create(null)

      mapping[root.id] = prepare(root)
      for (const dependency of root.dependencies({ recursive: true })) {
        deps.add(dependency)
        if (dependency.bundle) {
          debug('bundled dependency %s', utils.relative(dependency.path))
          bundle[dependency.id] = prepare(dependency)
        } else {
          debug('dependency %s', utils.relative(dependency.path))
          mapping[dependency.id] = prepare(dependency)
        }
      }

      root.mapping = mapping
    }

    for (const dep of deps) {
      tree.removeFile(dep, { force: true })
    }

    if (bundle) {
      const bundlePath = path.resolve(tree.root, config.bundle)
      debug('adding shared bundle to tree %s', utils.relative(bundlePath))

      const file = build.tree.addFile({
        path: bundlePath,
        mapping: bundle
      })

      roots.forEach(root => root.addDependency(file))
    }
  }

  /**
   * This postdependencies handler has the following responsibilities:
   *
   *  - removing non-output js/json files (any without a dependency mapping)
   *  - packing files with a mapping via browser-pack
   *
   * @param {File} file    The current file being processed.
   * @param {Build} build  The current build.
   */
  function * pack (file, build) {
    file.dependants().forEach(parent => parent.removeDependency(file))

    if (file.mapping) {
      debug('packing %s', utils.relative(file.path))
      yield doPack(file, values(file.mapping).sort(sortBy('path')), file.base, config)
    } else {
      build.tree.removeFile(file)
    }
  }

  /**
   * Transforms the given `file` into an object that is recognized by duo-pack.
   *
   * @param {File} file      The current file being processed.
   * @param {Boolean} entry  Whether or not this file is the entry.
   * @return {Object}
   */
  function prepare (file) {
    let relative = relativeInitial(file)
    return {
      id: relative,
      deps: file.deps || {},
      source: file.contents.toString(),
      sourceFile: config.sourceMaps ? relative : null,
      entry: isRoot(file)
    }
  }
}

/**
 * Inject node globals and env variables into the JS source code.
 *
 * @param {File} file      The file to process.
 * @param {Object} config  The build configuration.
 * @return {Promise}
 */
function postprocess (file, config) {
  return new Promise(function (resolve, reject) {
    if (config.browser) {
      pump(
        readable(file.contents),
        envify(file.path),
        insertGlobals(file.path, { basedir: file.base }),
        concat({ encoding: 'buffer' }, resolve),
        reject
      )
    } else {
      pump(
        readable(file.contents),
        insertGlobals(file.path, {
          basedir: file.base,
          vars: {
            process: null,
            global: null,
            'Buffer.isBuffer': null,
            Buffer: null,
            __filename: () => JSON.stringify(file.path),
            __dirname: () => JSON.stringify(file.dirname)
          }
        }),
        concat({ encoding: 'buffer' }, resolve),
        reject
      )
    }
  })
}

/**
 * Determine if a JS file is at the root of a dependency chain. (allows for
 * non-JS dependants, such as HTML)
 *
 * @param {File} file  The file to examine.
 * @return {Boolean}
 */
function isRoot (file) {
  // only js files can be roots
  if (file.type !== 'js') return false

  // if there are no dependants, this is assumed to be a root
  let dependants = file.dependants()
  if (dependants.length === 0) return true

  // if any of the dependants are not js, (ie: html) this is a root.
  return dependants.some(file => file.type !== 'js')
}

/**
 * Perform the actual pack, which converts the mapping into an object with
 * the output code and map.
 *
 * @param {File} file      The file to send the packed results to.
 * @param {Array} mapping  The code mapping. (see module-deps)
 * @param {String} root    The build root
 * @param {Object} config  The plugin configuration.
 */
function * doPack (file, mapping, root, config) {
  let bpack = config.bundle ? { hasExports: true } : null
  let code = yield runBrowserPack(mapping, root, bpack)
  let map = convert.fromSource(code.toString())
  if (map) map.setProperty('sourceRoot', config.sourceRoot)
  file.contents = new Buffer(convert.removeComments(code.toString()))
  file.sourceMap = config.sourceMaps ? map.toObject() : null
}

/**
 * Run the code through browser-pack, which only does an inline source map.
 *
 * @param {Array} mapping     The code mapping (see module-deps)
 * @param {String} root       The build root
 * @param {Object} [options]  Additional options to pass to browser-pack
 * @return {Promise}
 */
function runBrowserPack (mapping, root, options) {
  return new Promise(function (resolve, reject) {
    pump(
      streamify(mapping),
      bpack(Object.assign({ basedir: root, raw: true }, options)),
      concat({ encoding: 'buffer' }, resolve),
      reject
    )
  })
}

/**
 * Add the given list of modules to the core module list for resolve.
 *
 * @param {Array} modules  A list of module IDs.
 */
function customCoreModules (modules) {
  modules.forEach(function (id) {
    resolve.core[id] = true
  })
}

/**
 * Helper for retrieving the initialPath in relative form.
 *
 * @param {File} file  The input file.
 * @return {String}
 */
function relativeInitial (file) {
  return path.relative(file.base, file.initialPath)
}
