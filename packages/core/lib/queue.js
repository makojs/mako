
'use strict'

let Promise = require('bluebird')

class Queue {
  constructor (options) {
    this.factory = options.factory
    this.concurrency = options.concurrency
    this.available = options.available || []
    this.pending = new Set()
    this.done = new Set()
    this.resolve = null
    this.reject = null
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    if (this.available.length) this.run()
  }

  add () {
    // FIXME: use the code below if we ever need to support >1 args
    // var args = arguments.length === 1 ? [ arguments[0] ] : Array.apply(null, arguments)
    this.available.push([ arguments[0] ])
    this.run()
  }

  run () {
    let available = this.available
    let pending = this.pending
    let concurrency = this.concurrency

    while (pending.size < concurrency) {
      if (available.length === 0) break
      this.start(available.shift())
    }
  }

  start (args) {
    let p = this.factory.apply(null, args)
    this.pending.add(p)
    p.then(() => this.finish(p, args)).catch(err => this.reject(err))
  }

  finish (p, args) {
    let available = this.available
    let pending = this.pending
    let done = this.done

    pending.delete(p)
    done.add(p)
    this.run()

    if (available.length === 0 && pending.size === 0) this.resolve()
  }
}

module.exports = Queue
