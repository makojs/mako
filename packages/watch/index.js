
'use strict'

let chokidar = require('chokidar')
let debug = require('debug')('mako-watch')
let Emitter = require('events')
let utils = require('mako-utils')

class Watcher extends Emitter {
  constructor (tree, options) {
    debug('initialize %j', options)
    super()
    this.tree = tree
    this.root = tree.root
    this.watcher = this.initWatcher(options)
  }

  initWatcher (options) {
    debug('starting watch for %s', utils.relative(this.root))
    let params = Object.assign({ ignored: [ /node_modules/ ], ignoreInitial: true }, options)
    return chokidar.watch(this.root, params)
      .on('ready', () => this.handleReady())
      .on('change', (file, stat) => this.handleChange(file))
      .on('error', (err) => this.handleError(err))
      .on('add', (file) => this.handleAdd(file))
      .on('unlink', (file) => this.handleRemove(file))
  }

  handleReady () {
    debug('ready')
    this.emit('ready')
  }

  handleChange (abs) {
    debug('change %s', utils.relative(abs))
    let tree = this.tree
    let file = tree.findFile(abs)
    if (file) {
      this.emit('change', file, tree)
    } else {
      debug('file not found in dependency tree')
    }
  }

  handleAdd (abs) {
    debug('add %s', utils.relative(abs))
    this.emit('add', abs, this.tree)
  }

  handleRemove (abs) {
    debug('remove %s', utils.relative(abs))
    let tree = this.tree
    let file = tree.findFile(abs)
    if (file) {
      this.emit('remove', abs, this.tree)
    } else {
      debug('file not found in dependency tree')
    }
  }

  handleError (err) {
    debug('error %s', err.stack)
    this.emit('error', err)
  }

  unwatch () {
    debug('stopping watch for %s', utils.relative(this.root))
    this.watcher.close()
  }
}

module.exports = Watcher
