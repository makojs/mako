
'use strict'

let debug = require('debug')('mako:compile')
let Promise = require('bluebird')
let Queue = require('./queue')
let utils = require('./utils')

module.exports = Promise.coroutine(function * (build) {
  debug('compiling %j', build.entries)
  build.timeStart('compile')

  let writes = new WeakSet()
  let runner = build.runner
  let hooks = runner.hooks
  let entries = build.entries.map(file => build.tree.findFile(file)).filter(Boolean)

  // create a fresh tree for the new build
  build.timeStart('compile:clone-tree')
  let tree = build.tree = build.tree.clone()
  build.timeStop('compile:clone-tree')

  // prune out files that are unreachable from the chosen entry files
  build.timeStart('compile:prune-tree')
  tree.prune(entries)
  build.timeStop('compile:prune-tree')

  build.timeStart('precompile')
  yield runHooks('precompile', [ build ])
  build.timeStop('precompile')

  // forcefully break any cycles, so topological sorting is possible
  // any plugins that introduce circular dependencies should resolve them prior to this,
  // as mako cannot know what plugin authors would intend.
  build.timeStart('compile:decycle-tree')
  tree.removeCycles()
  build.timeStop('compile:decycle-tree')

  if (tree.size()) {
    build.timeStart('postdependencies')
    // during prewrite, files must be processed sequentially to allow unrolling cleanly
    // TODO: find a way to split the tree into subgraphs that can be processed in parallel
    for (let file of tree.getFiles({ topological: true })) {
      yield runHooks([ 'postdependencies', file.type ], [ file, build ])
    }
    build.timeStop('postdependencies')

    build.timeStart('write')
    var queue = new Queue({
      available: tree.getFiles().map(file => [ file ]),
      concurrency: runner.concurrency,
      factory: Promise.coroutine(write)
    })
    yield queue.promise
    build.timeStop('write')

    build.timeStart('postcompile')
    yield runHooks('postcompile', [ build ])
    build.timeStop('postcompile')
  }

  debug('compile finished (tree size: %s)', utils.treeSize(tree))
  build.timeStop('compile')
  return build

  function runHooks (key, args) {
    return hooks.run(key, args).then(stats => build.addTimings(stats))
  }

  function * write (file) {
    if (writes.has(file)) return
    writes.add(file)

    yield runHooks([ 'prewrite', file.type ], [ file, build ])
    yield runHooks([ 'write', file.type ], [ file, build ])
    yield runHooks([ 'postwrite', file.type ], [ file, build ])

    // during the write hooks, new files can be added to the tree
    // (eg: adding a ".gz" version of any file, adding a ".min.js" for each ".js", etc)
    // after each iteration, search the tree for any files not already in the tree
    tree.getFiles().filter(file => !writes.has(file)).forEach(file => queue.add(file))
  }
})
