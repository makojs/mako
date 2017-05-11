
'use strict'

let debug = require('debug')('mako:parse')
let Promise = require('bluebird')
let Queue = require('./queue')
let utils = require('./utils')

module.exports = Promise.coroutine(function * (build) {
  debug('parse %j', build.entries)

  build.timeStart('parse')
  let runner = build.runner
  let parsed = build.parsed = new Set()
  let hooks = runner.hooks
  let tree = runner.tree
  let entries = build.entries.map(file => tree.findFile(file) || tree.addFile(file))

  let queue = new Queue({
    concurrency: runner.concurrency,
    factory: Promise.coroutine(parse)
  })

  yield runHooks('preparse', [ build ])
  entries.forEach(entry => queue.add(entry))
  yield queue.promise
  yield runHooks('postparse', [ build ])
  debug('parse finished (tree size: %s)', utils.treeSize(tree))
  build.timeStop('parse')
  return build

  /**
   * Helper for running analysis on a file.
   *
   * @param {File} file  The target file.
   */
  function * parse (file) {
    if (file.parsing) {
      debug('file %s already being parsed', utils.relative(file.path))
      return
    }

    if (parsed.has(file)) {
      debug('file %s already parsed for this build', utils.relative(file.path))
      return
    }

    debug('parsing %s', utils.relative(file.path))
    file.parsing = true

    try {
      // preread is always run, as it has the opportunity to mark a file as
      // "dirty" so it will be parsed. (such as when an mtime changes)
      // preread also always uses the original file type in case later
      // plugins change the type, allowing entries to be transpiled and
      // still picked up correctly.
      yield runHooks([ 'preread', file.initialType ], [ file, build ])
      if (!file.parsed) {
        yield runHooks([ 'read', file.type ], [ file, build ])
        yield runHooks([ 'postread', file.type ], [ file, build ])
        yield runHooks([ 'predependencies', file.type ], [ file, build ])
        yield runHooks([ 'dependencies', file.type ], [ file, build ])
        // the postdependencies hook runs at the outset of the build phase

        debug('parsed %s', utils.relative(file.path))
        file.parsed = true
      } else {
        debug('file %s already parsed by this runner', utils.relative(file.path))
      }

      file.parsing = false
      parsed.add(file)
    } catch (err) {
      debug('file %s hit error "%s" during parse', utils.relative(file.path), err.stack)
      file.parsing = false
      throw err
    }

    file.dependencies().forEach(dep => queue.add(dep))
  }

  function runHooks (key, args) {
    return hooks.run(key, args).then(stats => build.addTimings(stats))
  }
})
