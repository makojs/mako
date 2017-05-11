'use strict'

let assert = require('assert')
let debug = require('debug')('mako-file')
let extension = require('file-extension')
let path = require('path')
let utils = require('mako-utils')
let uuid = require('uuid')
let Vinyl = require('vinyl')

/**
 * Represents a file within a build tree.
 *
 * @class
 */
class File extends Vinyl {
  /**
   * Sets up the instance.
   *
   * @param {Object} params  The vinyl params for this file.
   * @param {Tree} tree      The parent build tree.
   */
  constructor (params, tree) {
    assert(params, 'params needed to initialize a file')
    debug('initialize with %s', params)

    if (typeof params === 'string') {
      super({ path: params })
    } else {
      super(params)
    }

    if (!this.id) this.id = File.id()
    this.tree = tree
  }

  /**
   * Check to see if this file has the given path currently. (or did at some
   * point in it's history)
   *
   * @param {String} path  The absolute path to search for.
   * @return {Boolean} has
   */
  hasPath (path) {
    return this.history.indexOf(path) > -1
  }

  /**
   * Check to see if the `child` file is a dependency of this file.
   *
   * @see Tree#hasDependency()
   * @param {String} child  The file ID of the dependency.
   * @return {Boolean} has
   */
  hasDependency (child) {
    return this.tree.hasDependency(this.id, child)
  }

  /**
   * Adds the `child` as a dependency of this file. Returns the new `File`
   * instance.
   *
   * @see Tree#addDependency()
   * @param {String} child  The file ID of the dependency.
   */
  addDependency (child) {
    this.tree.addDependency(this.id, child)
  }

  /**
   * Removes the `child` as a dependency of this file.
   *
   * @see Tree#removeDependency()
   * @param {String} child  The file ID of the dependency.
   */
  removeDependency (child) {
    this.tree.removeDependency(this.id, child)
  }

  /**
   * Find the dependencies of this file.
   *
   * @see Tree#dependencies()
   * @param {Object} options  The search criteria.
   * @return {Array} files
   */
  dependencies (options) {
    return this.tree.dependenciesOf(this.id, options)
  }

  /**
   * Check to see if the `parent` file is a dependant of this file.
   *
   * @see Tree#hasDependant()
   * @param {String} parent  The file ID of the dependant.
   * @return {Boolean} has
   */
  hasDependant (parent) {
    return this.tree.hasDependant(this.id, parent)
  }

  /**
   * Adds the `parent` as a dependant of this file. Returns the new `File`
   * instance.
   *
   * @see Tree#addDependant()
   * @param {String} parent  The file ID of the dependant.
   */
  addDependant (parent) {
    this.tree.addDependant(this.id, parent)
  }

  /**
   * Removes the `parent` as a dependant of this file.
   *
   * @see Tree#removeDependant()
   * @param {String} parent  The file ID of the dependant.
   */
  removeDependant (parent) {
    this.tree.removeDependant(this.id, parent)
  }

  /**
   * Find the dependants of this file.
   *
   * @see Tree#dependants()
   * @param {Object} options  The search criteria.
   * @return {Array} files
   */
  dependants (options) {
    return this.tree.dependantsOf(this.id, options)
  }

  /**
   * Used to reset a file prior to re-running the analyze phase.
   */
  reset () {
    this.history.splice(1)
    this.contents = null
  }

  /**
   * Retrieves the current type for the file.
   *
   * @return {String} type
   */
  get type () {
    return extension(this.basename)
  }

  /**
   * Set the type/extension for this file.
   *
   * @param {String} type  The type (without the leading dot)
   */
  set type (type) {
    this.extname = `.${type}`
  }

  /**
   * Gets the initial path for this file.
   *
   * @return {String} path
   */
  get initialPath () {
    return this.history[0]
  }

  /**
   * Determine the original file type for this file (as if no transformations
   * have been run)
   *
   * @return {String} type
   */
  get initialType () {
    return extension(path.basename(this.initialPath))
  }

  /**
   * Creates a clone of this file.
   *
   * @param {Tree} tree  The tree to attach the clone to.
   * @return {File}
   */
  clone (tree) {
    debug('cloning %s', utils.relative(this.path))
    let clone = super.clone()
    clone.tree = tree || this.tree
    return clone
  }

  /**
   * Performs a deep copy of this file, making the following alterations after
   * successfully cloning:
   *  - a new id is generated (so it can be added to a tree as a different file)
   *  - uses `newPath` to update the path (relative to the current path)
   *
   * Available `options` include:
   *  - resetPath: if enabled, it will reset file.history with only the new path
   *
   * @param {String} newPath  The relative path for this new file.
   * @param {Object} options  Additional options.
   * @return {File} copy
   */
  copy (newPath, options) {
    assert(newPath, 'a new path is required to copy a file')
    debug('copying %s', utils.relative(this.path))
    let absolute = path.resolve(this.dirname, newPath)
    let copy = this.clone()
    copy.id = File.id()
    if (options && options.resetPath) {
      copy.history = [ absolute ]
    } else {
      copy.path = absolute
    }
    return copy
  }

  /**
   * Returns a trimmed object that can be serialized as JSON. It strips the tree
   * link and includes all other properties, including the custom ones.
   *
   * @return {File} obj
   */
  toJSON () {
    let clone = this.clone()
    delete clone.tree
    return clone
  }

  /**
   * Allow for easier logging.
   *
   * @return {String} str
   */
  toString () {
    return this.inspect()
  }

  /**
   * Used to parse a string value into a usable file.
   *
   * @static
   * @param {String} input  The raw JSON string to parse.
   * @param {Tree} tree     The tree to associate this file with.
   * @return {File}
   */
  static fromObject (input, tree) {
    let props = Object.assign({}, input, { path: null })
    props.contents = props._contents
    delete props._contents
    return new File(props, tree)
  }

  /**
   * Used to generate IDs, exposed as a static method to allow customization.
   *
   * @return {String} id
   */
  static id () {
    return uuid.v4()
  }
}

// single export
module.exports = File
