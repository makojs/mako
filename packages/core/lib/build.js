
'use strict'

let debug = require('debug')('mako:build')

/**
 * Used to follow an entire build from start to finish, particularly for stats
 * and reporting.
 *
 * @class
 */
class Build {
  /**
   * Creates a new instance.
   *
   * @param {Runner} runner  The spawning Runner instance
   * @param {Array} entries  The entry files to process for this build
   * @param {Tree} tree      The tree to use for this build
   */
  constructor (runner, entries, tree) {
    debug('initialize')
    this.runner = runner
    this.entries = entries
    this.tree = tree
    this.timing = new Map()
    this.timers = new Map()
  }

  /**
   * Allow for timing groups of things in a build. Rather than tracking
   * individual things only, each label is expected to be called multiple times,
   * likely for each file in the build. (they will be added together throughout
   * the build)
   *
   * The function returned can simply be called to conclude the timer
   *
   * @param {String} label  The label for this group.
   * @return {Function}
   */
  time (label) {
    debug('creating timer %s', label)
    let start = process.hrtime()
    let called = false
    return () => {
      if (called) {
        debug('timer %s called twice, this should be fixed')
      } else {
        this.addTiming(label, process.hrtime(start))
        called = true
      }
    }
  }

  /**
   * Allows for timing events that only occur once in a build. (as opposed to
   * `time()` which is better for things timed repeatedly)
   *
   * @param {String} id  Must be unique for each start/stop.
   */
  timeStart (id) {
    this.timers.set(id, process.hrtime())
  }

  /**
   * Indicate that the timer started by `timeStart()` is finished.
   *
   * @param {String} id  Must be unique for each start/stop.
   */
  timeStop (id) {
    let start = this.timers.get(id, process.hrtime())
    this.addTiming(id, process.hrtime(start))
  }

  /**
   * Adds a list of run stats to the internal tracker.
   *
   * @param {Array} runs  Stats returned from the plugin runner
   */
  addTimings (runs) {
    if (!runs) return
    runs.forEach(run => this.addTiming(`${run.id}:${run.plugin}`, run.duration))
  }

  /**
   * Add the duration for label to the internal tracker.
   *
   * @param {String} id       The timing label/id
   * @param {Array} duration  The hrtime array
   */
  addTiming (label, duration) {
    let existing = this.timing.get(label)
    this.timing.set(label, add(existing, duration))
  }

  /**
   * Tell the attached runner to mark the file as dirty.
   *
   * @param {File} file  The file to reset.
   */
  dirty (file) {
    debug('marking file dirty %s', file)
    this.runner.dirty(file)
  }
}

module.exports = Build

/**
 * Adds 2 hi-res times together.
 *
 * @param {Array} a  The previous timing value.
 * @param {Array} b  The timing value to add.
 * @return {Array}
 */
function add (a, b) {
  if (!a) return b.slice() // copy
  return [ a[0] + b[0], a[1] + b[1] ]
}
