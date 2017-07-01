'use strict'

require('babel-polyfill-safer')

let assert = require('assert')
let bytes = require('bytes')
let debug = require('debug')('mako-tree')
let File = require('./file')
let iso = require('regex-iso-date')()
let Graph = require('graph.js/dist/graph.js')
let toposort = require('graph-toposort')
let utils = require('mako-utils')

/**
 * Represents a dependency graph for the builder.
 *
 * @class
 */
class Tree {
  /**
   * Creates a new instance, particularly creating the Graph instance.
   *
   * @param {String} root  The optional project root. (default: pwd)
   */
  constructor (root) {
    debug('initialize')
    this.root = root || process.cwd()
    this.graph = new Graph()
  }

  /**
   * Implement the iterator interface to allow iterating the files in this
   * tree topologically.
   *
   * TODO: allow configuring the iteration order (ie: turn topological off)
   */
  [Symbol.iterator] () {
    return this.getFiles({ topological: true }).values()
  }

  /**
   * Checks to see if the given file ID exists in the tree.
   *
   * @param {String} file  The file or string ID.
   * @return {Boolean} has
   */
  hasFile (file) {
    return this.graph.hasVertex(id(file))
  }

  /**
   * Adds the file with the given `params` to the tree. If a file with that
   * path already exists in the tree, that is returned instead.
   *
   * @param {Object} params  The vinyl params for this file.
   * @return {File} file
   */
  addFile (params) {
    if (typeof params === 'string') {
      params = { base: this.root, path: params }
    } else {
      params.base = this.root
    }

    let file = new File(params, this)
    debug('adding file: %s', utils.relative(file.path))
    this.graph.addNewVertex(file.id, file)
    return file
  }

  /**
   * Returns the `File` with the given `id`.
   *
   * @param {String} file  The file ID.
   * @return {File} file
   */
  getFile (file) {
    return this.graph.vertexValue(file)
  }

  /**
   * Iterates through the files looking for one that matches the input path.
   *
   * @param {String} file  The path to search for.
   * @return {File} file
   */
  findFile (file) {
    let timer = utils.timer()
    let path = typeof file === 'string' ? file : file.path
    debug('searching for file with path %s', utils.relative(path))
    for (let vertex of this.graph.vertices()) {
      let file = vertex[1]
      if (file.hasPath(path)) {
        debug('match found: %s (took %s)', utils.relative(file.path), timer())
        return file
      }
    }
    debug('file not found (took %s)', timer())
  }

  /**
   * Retrieve a list of file paths based on the given criteria.
   *
   * Available `options`:
   *  - `topological` sort the files topologically
   *
   * @param {Object} options  The optional filter criteria.
   * @return {Array} files
   */
  getFiles (options) {
    let timer = utils.timer()
    let topological = options ? !!options.topological : false
    debug('getting %d files: (topological: %j)', this.size(), topological)

    let files = topological
      ? toposort(this.graph).map(id => this.getFile(id))
      : Array.from(this.graph.vertices()).map(v => v[1])

    debug('finished getting %d files (took %s)', files.length, timer())
    return files
  }

  /**
   * Remove the file with the given `id` from the graph.
   *
   * Available `options`:
   *  - `force` removes the file even if dependencies/dependants exist
   *
   * @param {String} node     The file or string ID.
   * @param {Object} options  Additional options.
   */
  removeFile (node, options) {
    let force = options ? !!options.force : false
    let file = this.getFile(id(node))
    assert(file, `cannot find file ${node} in this tree`)
    const relative = utils.relative(file.path)
    debug('removing file %s: (force: %j)', relative, force)

    if (force) {
      this.graph.destroyVertex(file.id)
    } else {
      if (this.graph.degree(file.id) > 0) {
        throw new Error(`cannot remove ${relative} while it still has dependencies in the tree (use force: true to override this)`)
      }

      this.graph.removeVertex(file.id)
    }
  }

  /**
   * Checks to see if the given `parent` has a link to dependency `child`.
   *
   * Available `options`:
   *  - `recursive`: check for the dependency recursively
   *
   * @param {String} parent   The parent file (or it's string ID).
   * @param {String} child    The child file (or it's string ID).
   * @param {Object} options  Additional options.
   * @return {Boolean} has
   */
  hasDependency (parent, child, options) {
    let recursive = options ? !!options.recursive : false
    return recursive
      ? this.graph.hasPath(id(child), id(parent))
      : this.graph.hasEdge(id(child), id(parent))
  }

  /**
   * Sets up the file `child` as a dependency of `parent`.
   *
   * @param {String} parent  The parent file (or it's string ID).
   * @param {String} child   The child file (or it's string ID).
   */
  addDependency (parent, child) {
    let childFile = this.getFile(id(child))
    assert(childFile, `cannot add dependency because ${child} is not in the tree`)
    let parentFile = this.getFile(id(parent))
    assert(parentFile, `cannot add dependency because ${parent} is not in the tree`)

    this.graph.addEdge(childFile.id, parentFile.id)
    debug('added dependency %s -> %s', utils.relative(childFile.path), utils.relative(parentFile.path))
  }

  /**
   * Removes the dependency `child` from the `parent` file.
   *
   * @param {String} parent  The parent file (or it's string ID).
   * @param {String} child   The child file (or it's string ID).
   */
  removeDependency (parent, child) {
    let childFile = this.getFile(id(child))
    assert(childFile, `cannot remove dependency because ${child} is not in the tree`)
    let parentFile = this.getFile(id(parent))
    assert(parentFile, `cannot remove dependency because ${parent} is not in the tree`)

    this.graph.removeEdge(childFile.id, parentFile.id)
    debug('removed dependency %s -> %s', utils.relative(childFile.path), utils.relative(parentFile.path))
  }

  /**
   * Return a list of all files that the given `node` file depends on.
   *
   * Available `options`:
   *  - `recursive` when set, go recursively down the entire graph
   *
   * @param {String} node     The parent file (or it's string ID).
   * @param {Object} options  Optional search criteria.
   * @return {Array} files
   */
  dependenciesOf (node, options) {
    let timer = utils.timer()
    let recursive = options ? !!options.recursive : false
    let file = this.getFile(id(node))
    debug('getting dependencies of %s: (recursive: %j)', utils.relative(file.path), recursive)

    let deps = recursive
      ? Array.from(this.graph.verticesWithPathTo(file.id))
      : Array.from(this.graph.verticesTo(file.id))

    debug('%d dependencies found (took %s)', deps.length, timer())
    return deps.map(v => v[1])
  }

  /**
   * Checks to see if the given `child` has a link to dependant `parent`.
   *
   * Available `options`:
   *  - `recursive` looks for the dependant recursively.
   *
   * @param {String} child    The child file (or it's string ID).
   * @param {String} parent   The parent file (or it's string ID).
   * @param {Object} options  Additional options.
   * @return {Boolean} has
   */
  hasDependant (child, parent, options) {
    return this.hasDependency(parent, child, options)
  }

  /**
   * Sets up the given `parent` as a dependant of `child`. In other words,
   * the reverse of addDependency()
   *
   * @param {String} child   The child file (or it's string ID).
   * @param {String} parent  The parent file (or it's string ID).
   */
  addDependant (child, parent) {
    let childFile = this.getFile(id(child))
    assert(childFile, `cannot add dependant because ${child} is not in the tree`)
    let parentFile = this.getFile(id(parent))
    assert(parentFile, `cannot add dependant because ${parent} is not in the tree`)

    this.graph.addEdge(childFile.id, parentFile.id)
    debug('added dependant %s <- %s', utils.relative(childFile.path), utils.relative(parentFile.path))
  }

  /**
   * Removes the dependant `parent` from the `child` file.
   *
   * @param {String} child   The child file (or it's string ID).
   * @param {String} parent  The parent file (or it's string ID).
   */
  removeDependant (child, parent) {
    let childFile = this.getFile(id(child))
    assert(childFile, `cannot remove dependant because ${child} is not in the tree`)
    let parentFile = this.getFile(id(parent))
    assert(parentFile, `cannot remove dependant because ${parent} is not in the tree`)

    this.graph.removeEdge(childFile.id, parentFile.id)
    debug('removed dependant %s <- %s', utils.relative(childFile.path), utils.relative(parentFile.path))
  }

  /**
   * Return a list of all files that depend on the given `node` file.
   *
   * Available `options`:
   *  - `recursive` when set, go recursively down the entire graph
   *
   * @param {String} node     The child file (or it's string ID).
   * @param {Object} options  The search criteria.
   * @return {Array} files
   */
  dependantsOf (node, options) {
    let timer = utils.timer()
    let recursive = options ? !!options.recursive : false
    let file = this.getFile(id(node))
    debug('getting dependants of %s: (recursive: %j)', utils.relative(file.path), recursive)

    let deps = recursive
      ? Array.from(this.graph.verticesWithPathFrom(id(file)))
      : Array.from(this.graph.verticesFrom(id(file)))

    debug('%d dependants found (took %s)', deps.length, timer())
    return deps.map(v => v[1])
  }

  /**
   * Tells us how many files are in the tree.
   *
   * @return {Number} size
   */
  size () {
    return this.graph.vertexCount()
  }

  /**
   * Returns a clone of the current `Tree` instance.
   *
   * @return {Tree} clone
   */
  clone () {
    debug('cloning tree')
    let timer = utils.timer()
    let tree = new Tree(this.root)
    tree.graph = this.graph.clone(file => file.clone(tree), value => value)
    debug('cloned tree (took %s)', timer())
    return tree
  }

  /**
   * Remove any files that cannot be reached from the given `anchors`.
   *
   * @param {Array} anchors  A list of files to anchor others to.
   */
  prune (anchors) {
    let timer = utils.timer()
    let initialSize = this.size()
    let files = anchors.map(file => this.getFile(id(file)))
    debug('pruning files from tree that are not accessible from:')
    files.forEach(file => debug('> %s', utils.relative(file.path)))

    let deps = new Set()
    files.forEach(file => {
      deps.add(file)
      this.dependenciesOf(file, { recursive: true })
        .forEach(file => deps.add(file))
    })

    this.getFiles()
      .filter(file => !deps.has(file))
      .forEach(file => this.removeFile(file, { force: true }))

    debug('%d files pruned from tree (took %s)', initialSize, timer())
  }

  /**
   * Forcibly make this graph acyclic.
   */
  removeCycles () {
    debug('removing cycles from tree')
    let timer = utils.timer()
    let graph = this.graph
    let count = 0
    while (graph.hasCycle()) {
      let cycle = graph.cycle()
      let files = cycle.map(file => this.getFile(file))
      debug('cycle detected:')
      files.forEach(file => debug('> %s (degree: %d)', utils.relative(file.path), graph.outDegree(file.id)))
      // prefer to remove edges where the degree is higher, in an attempt to
      // avoid altering the graph more than necessary.
      let degrees = files.map(file => graph.outDegree(file.id))
      let highest = degrees.indexOf(Math.max.apply(Math, degrees))
      let child = files[highest]
      let parent = files[highest + 1] ? files[highest + 1] : files[0]
      this.removeDependency(parent, child)
      count++
    }
    debug('removed %d cycles (took %s)', count, timer())
  }

  /**
   * Returns a trimmed object that can be serialized as JSON. It includes a list
   * of vertices and edges for reconstructing the underlying graph.
   *
   * @return {Object} obj
   */
  toJSON () {
    debug('convert to json')
    let timer = utils.timer()
    let o = {
      root: this.root,
      files: this.getFiles(),
      dependencies: Array.from(this.graph.edges()).map(e => e.slice(0, 2))
    }
    debug('converted to json (took %s)', timer())
    return o
  }

  /**
   * Serializes the tree into a plain JSON string for writing to storage.
   * (probably disk)
   *
   * @param {Number} space  The JSON.stringify space parameter.
   * @return {String} str
   */
  toString (space) {
    debug('convert to string')
    let timer = utils.timer()
    let str = JSON.stringify(this, null, space)
    debug('converted to %s string (took %s)', bytes(str.length), timer())
    return str
  }

  /**
   * Used to parse a string value into a usable tree.
   *
   * @static
   * @param {String} input  The raw JSON string to parse.
   * @return {Tree} tree
   */
  static fromString (input) {
    debug('convert from string')
    let timer = utils.timer()
    let parsed = JSON.parse(input, reviver)
    let tree = new Tree(parsed.root)

    parsed.files.forEach(o => {
      let file = File.fromObject(o, tree)
      debug('file from cache: %s', file.id)
      tree.graph.addNewVertex(file.id, file)
    })

    parsed.dependencies.forEach(e => {
      debug('dependency from cache: %s', e.join(' '))
      tree.graph.addNewEdge(e[0], e[1])
    })

    debug('converted from %s string (took %s)', bytes(input.length), timer())
    return tree
  }
}

// single export
module.exports = Tree

/**
 * Helper for retrieving a file id.
 *
 * @param {File} file  The file object or a string id.
 * @return {String} id
 */
function id (file) {
  return file instanceof File ? file.id : file
}

/**
 * JSON.parse reviver param for restoring buffers and dates to file objects.
 *
 * @param {String} key    See JSON.parse reviver documentation
 * @param {String} value  See JSON.parse reviver documentation
 * @return {Mixed} revived
 */
function reviver (key, value) {
  if (value && value.type === 'Buffer') {
    return Buffer.from(value.data)
  }

  if (typeof value === 'string' && iso.test(value)) {
    return new Date(value)
  }

  return value
}
