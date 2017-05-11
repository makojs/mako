
'use strict'

let assert = require('assert')
let cache = require('mako-cache')
let compose = require('koa-compose')
let debug = require('debug')('mako-serve')
let defaults = require('defaults')
let livereload = require('livereload-base')
let mako = require('mako')
let path = require('path')
let Promise = require('bluebird')
let serve = require('koa-static')
let Watcher = require('mako-watch')
let utils = require('mako-utils')

module.exports = function (options) {
  debug('initialize %j', options)
  let config = defaults(options, {
    root: process.cwd(),
    output: 'build',
    entries: [],
    plugins: [],
    cache: false,
    livereload: false
  })
  assert(config.entries.length > 0, 'an entry file is required')

  let lr = config.livereload ? livereload.createServer() : null

  let runner = mako({
    tree: config.cache ? cache.loadSync(config.root) : null,
    root: config.root,
    plugins: config.plugins
  })

  let watcher = new Watcher(runner.tree)

  watcher.on('change', (file, tree) => {
    debug('change detected: %s', utils.relative(file.path))
    runner.dirty(file)
    Promise.coroutine(runBuild)(file)
  })

  debug('starting initial build')
  let preload = Promise.coroutine(runBuild)()
    .tap(() => debug('finished initial build'))

  return {
    middleware: compose([
      function * (next) {
        // all requests should wait until the initial build finishes
        yield preload
        yield next
      },
      serve(path.resolve(config.root, config.output), { defer: true })
    ]),
    watcher: watcher,
    livereload: lr
  }

  function * runBuild (file) {
    const tree = runner.tree
    const entries = findEntries(config.entries, tree, file)
    let build = yield runner.build(entries)
    if (config.livereload) build.tree.getFiles().forEach(file => lr.reload(file.relative))
    if (config.cache) cache.save(tree)
  }
}

function findEntries (entries, tree, file) {
  if (!file) return entries
  return entries
    .map(entry => tree.findFile(entry))
    .filter(entry => entry === file || tree.hasDependency(entry, file, { recursive: true }))
}
