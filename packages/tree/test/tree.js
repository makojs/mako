/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let bufferEqual = require('buffer-equal')
let File = require('../lib/file')
let Tree = require('../lib/tree')

describe('Tree([root])', function () {
  it('should be a constructor function', function () {
    assert.instanceOf(new Tree(), Tree)
  })

  it('should add the root property', function () {
    let tree = new Tree('a')
    assert.strictEqual(tree.root, 'a')
  })

  it('should be empty by default', function () {
    let tree = new Tree()
    assert.equal(tree.size(), 0)
  })

  describe('@@iterator()', function () {
    // index.html <- index.js  <- shared.js
    //            <- index.css <- shared.css
    let tree = new Tree()
    let html = tree.addFile('index.html')
    let js = tree.addFile('index.js')
    let sharedJS = tree.addFile('shared.js')
    let css = tree.addFile('index.css')
    let sharedCSS = tree.addFile('shared.css')
    tree.addDependency(html, js)
    tree.addDependency(html, css)
    tree.addDependency(js, sharedJS)
    tree.addDependency(css, sharedCSS)

    it('should implement the iterator interface', function () {
      let count = 0
      for (const file of tree) {
        count += 1
        assert.instanceOf(file, File)
      }
      assert.equal(count, 5)
    })

    it('should sort the items topologically', function () {
      let files = []
      for (const file of tree) files.push(file)
      assert.deepEqual(files, [ sharedJS, sharedCSS, js, css, html ])
    })
  })

  describe('#hasFile(id)', function () {
    let tree = new Tree()
    let file = tree.addFile({ path: 'a.js' })

    it('should return false for a missing node', function () {
      assert.isFalse(tree.hasFile('does-not-exist'))
    })

    it('should return true for an existing node', function () {
      assert.isTrue(tree.hasFile(file))
    })

    it('should allow using a string id', function () {
      assert.isTrue(tree.hasFile(file.id))
    })
  })

  describe('#addFile(params)', function () {
    it('should add the file to the graph', function () {
      let tree = new Tree()
      tree.addFile('a')
      assert.strictEqual(tree.size(), 1)
    })

    it('should return the new file', function () {
      let tree = new Tree()
      let a = tree.addFile('a')
      assert.instanceOf(a, File)
    })

    it('should set the path of the new file', function () {
      let tree = new Tree()
      let a = tree.addFile('a')
      assert.strictEqual(a.path, 'a')
    })

    it('should support objects', function () {
      let tree = new Tree()
      let a = tree.addFile({ path: 'a' })
      assert.strictEqual(a.path, 'a')
    })

    context('with root', function () {
      it('should impose tree.root as file.base', function () {
        let tree = new Tree('a')
        let file = tree.addFile('z')
        assert.strictEqual(file.base, 'a')
      })

      it('should override any specified base with tree.root', function () {
        let tree = new Tree('a')
        let file = tree.addFile({ base: 'b', path: 'z' })
        assert.strictEqual(file.base, 'a')
      })
    })
  })

  describe('#getFile(file)', function () {
    let tree = new Tree()
    let file = tree.addFile('index.html')

    it('should return a file instance', function () {
      assert.strictEqual(tree.getFile(file.id), file)
    })

    it('should return undefined when the file does not exist', function () {
      assert.isUndefined(tree.getFile('does-not-exist'))
    })
  })

  describe('#findFile(file)', function () {
    let tree = new Tree()
    let file = tree.addFile('/path/to/index.jade')
    file.type = 'html' // intentionally change extension to add to history

    it('should return the file instance if the path matches', function () {
      assert.strictEqual(file, tree.findFile('/path/to/index.html'))
    })

    it('should return the file instance if anything in the history matches', function () {
      assert.strictEqual(file, tree.findFile('/path/to/index.jade'))
    })

    it('should return undefined when the file does not exist', function () {
      assert.isUndefined(tree.findFile('does-not-exist'))
    })

    it('should support passing objects', function () {
      assert.strictEqual(file, tree.findFile({ path: '/path/to/index.html' }))
    })
  })

  describe('#getFiles([options])', function () {
    // index.html <- index.js  <- shared.js
    //            <- index.css <- shared.css
    let tree = new Tree()
    let html = tree.addFile('index.html')
    let js = tree.addFile('index.js')
    let sharedJS = tree.addFile('shared.js')
    let css = tree.addFile('index.css')
    let sharedCSS = tree.addFile('shared.css')
    tree.addDependency(html, js)
    tree.addDependency(html, css)
    tree.addDependency(js, sharedJS)
    tree.addDependency(css, sharedCSS)

    it('should return a list of all the files in the tree', function () {
      let files = tree.getFiles()
      assert.lengthOf(files, tree.size())
      assert.sameMembers(files, [ html, js, css, sharedJS, sharedCSS ])
    })

    context('with options', function () {
      context('.topological', function () {
        it('should sort the results topologically', function () {
          assert.deepEqual(tree.getFiles({ topological: true }), [ sharedJS, sharedCSS, js, css, html ])
        })
      })
    })
  })

  describe('#removeFile(file, [options])', function () {
    it('should remove the file from the tree', function () {
      let tree = new Tree()
      let file = tree.addFile('index.html')

      tree.removeFile(file)
      assert.isFalse(tree.hasFile(file))
    })

    it('should fail if there are still dependencies defined', function () {
      // index.html <- index.js
      let tree = new Tree()
      let html = tree.addFile('index.html')
      let js = tree.addFile('index.js')
      tree.addDependency(html, js)

      assert.throws(() => tree.removeFile(html), 'cannot remove index.html while it still has dependencies in the tree (use force: true to override this)')
    })

    it('should support using a string id', function () {
      let tree = new Tree()
      let file = tree.addFile('index.html')

      tree.removeFile(file.id)
      assert.isFalse(tree.hasFile(file))
    })

    it('should fail when the given id is not present in the tree', function () {
      let tree = new Tree()

      assert.throws(() => tree.removeFile('does not exist'), 'cannot find file does not exist in this tree')
    })

    context('with options', function () {
      context('.force', function () {
        // index.html <- index.js
        let tree = new Tree()
        let html = tree.addFile('index.html')
        let js = tree.addFile('index.js')
        tree.addDependency(html, js)

        tree.removeFile(html, { force: true })
        assert.isFalse(tree.hasFile(html))
        assert.isTrue(tree.hasFile(js))
      })
    })
  })

  describe('#hasDependency(parent, child, [options])', function () {
    // index.html <- index.js <- lib.js
    let tree = new Tree()
    let html = tree.addFile('index.html')
    let js = tree.addFile('index.js')
    let lib = tree.addFile('lib.js')
    tree.addDependency(html, js)
    tree.addDependency(js, lib)

    it('should return false for a missing dependency', function () {
      assert.isFalse(tree.hasDependency(html, 'does-not-exist'))
    })

    it('should return false when the dependency link is reversed', function () {
      assert.isFalse(tree.hasDependency(js, html))
    })

    it('should return false if the dependency is deep', function () {
      assert.isFalse(tree.hasDependency(html, lib))
    })

    it('should return true for an existing dependency', function () {
      assert.isTrue(tree.hasDependency(html, js))
    })

    it('should allow using a string id', function () {
      assert.isTrue(tree.hasDependency(html.id, js.id))
    })

    context('with options', function () {
      describe('.recursive', function () {
        it('should search the dependency tree recursively', function () {
          assert.isTrue(tree.hasDependency(html, lib, { recursive: true }))
        })
      })
    })
  })

  describe('#addDependency(parent, child)', function () {
    it('should set child as a dependency of parent', function () {
      // index.html <- index.js
      let tree = new Tree()
      let html = tree.addFile('index.html')
      let js = tree.addFile('index.js')

      tree.addDependency(html, js)
      assert.isTrue(tree.hasDependency(html, js))
    })

    it('should throw if the parent was not already defined', function () {
      let tree = new Tree()
      let js = tree.addFile('index.js')

      assert.throws(function () {
        tree.addDependency('does-not-exist', js)
      })
    })

    it('should throw if the child was not already defined', function () {
      let tree = new Tree()
      let html = tree.addFile('index.html')

      assert.throws(function () {
        tree.addDependency(html, 'does-not-exist')
      })
    })

    it('should allow using string ids', function () {
      // index.html <- index.js
      let tree = new Tree()
      let html = tree.addFile('index.html')
      let js = tree.addFile('index.js')
      tree.addDependency(html.id, js.id)

      assert.isTrue(tree.hasDependency(html, js))
    })

    it('should fail when the parent file is not in the tree', function () {
      let tree = new Tree()
      let parent = 'does not exist'
      let child = tree.addFile('index.html')

      assert.throws(() => tree.addDependency(parent, child), `cannot add dependency because ${parent} is not in the tree`)
    })

    it('should fail when the child file is not in the tree', function () {
      let tree = new Tree()
      let parent = tree.addFile('index.html')
      let child = 'does not exist'

      assert.throws(() => tree.addDependency(parent, child), `cannot add dependency because ${child} is not in the tree`)
    })
  })

  describe('#removeDependency(parent, child)', function () {
    it('should remove the edge from the graph', function () {
      // index.html <- index.js
      let tree = new Tree()
      let html = tree.addFile('index.html')
      let js = tree.addFile('index.js')
      tree.addDependency(html, js)

      tree.removeDependency(html, js)
      assert.isFalse(tree.hasDependency(html, js))
    })

    it('should allow using string ids', function () {
      // index.html <- index.js
      let tree = new Tree()
      let html = tree.addFile('index.html')
      let js = tree.addFile('index.js')
      tree.addDependency(html, js)

      tree.removeDependency(html.id, js.id)
      assert.isFalse(tree.hasDependency(html, js))
    })

    it('should fail when the parent file is not in the tree', function () {
      let tree = new Tree()
      let html = tree.addFile('index.html')
      let js = tree.addFile('index.js')
      tree.addDependency(html, js)

      assert.throws(() => tree.removeDependency('does not exist', js.id), 'cannot remove dependency because does not exist is not in the tree')
    })

    it('should fail when the child file is not in the tree', function () {
      let tree = new Tree()
      let html = tree.addFile('index.html')
      let js = tree.addFile('index.js')
      tree.addDependency(html, js)

      assert.throws(() => tree.removeDependency(html.id, 'does not exist'), 'cannot remove dependency because does not exist is not in the tree')
    })
  })

  describe('#dependenciesOf(file, [options])', function () {
    // index.js <- a.js <- b.js <- c.js
    let tree = new Tree()
    let js = tree.addFile('index.js')
    let a = tree.addFile('a.js')
    let b = tree.addFile('b.js')
    let c = tree.addFile('c.js')
    tree.addDependency(js, a)
    tree.addDependency(a, b)
    tree.addDependency(b, c)

    it('should return the direct dependencies of node', function () {
      assert.deepEqual(tree.dependenciesOf(js), [ a ])
    })

    it('should allow using a string id', function () {
      assert.deepEqual(tree.dependenciesOf(js.id), [ a ])
    })

    context('with options', function () {
      context('.recursive', function () {
        it('should all the dependencies of node', function () {
          assert.deepEqual(tree.dependenciesOf(js, { recursive: true }), [ a, b, c ])
        })

        it('should allow using a string id', function () {
          assert.deepEqual(tree.dependenciesOf(js.id, { recursive: true }), [ a, b, c ])
        })
      })
    })
  })

  describe('#hasDependant(child, parent, [options])', function () {
    // a.js <- b.js <- c.js
    let tree = new Tree()
    let a = tree.addFile('a.js')
    let b = tree.addFile('b.js')
    let c = tree.addFile('c.js')
    tree.addDependency(a, b)
    tree.addDependency(b, c)

    it('should return false for a missing dependency', function () {
      assert.isFalse(tree.hasDependant(b, 'does-not-exist'))
    })

    it('should return false for a reversed dependency', function () {
      assert.isFalse(tree.hasDependant(a, b))
    })

    it('should return false when the depedency is deep', function () {
      assert.isFalse(tree.hasDependant(a, c))
    })

    it('should return true for an existing dependency', function () {
      assert.isTrue(tree.hasDependant(b, a))
    })

    it('should allow using string ids', function () {
      assert.isTrue(tree.hasDependant(b.id, a.id))
    })

    context('with options', function () {
      describe('.recursive', function () {
        it('should return true when the dependant is deep', function () {
          assert.isTrue(tree.hasDependant(c, a, { recursive: true }))
        })
      })
    })
  })

  describe('#addDependant(child, parent)', function () {
    it('should create an edge between the child and parent', function () {
      // a.js <- b.js
      let tree = new Tree()
      let a = tree.addFile('a.js')
      let b = tree.addFile('b.js')

      tree.addDependant(b, a)
      assert.isTrue(tree.hasDependant(b, a))
    })

    it('should throw if the parent was not already defined', function () {
      let tree = new Tree()
      let b = tree.addFile('b.js')

      assert.throws(function () {
        tree.addDependant(b, 'does-not-exist')
      })
    })

    it('should throw if the child was not already defined', function () {
      let tree = new Tree()
      let a = tree.addFile('a.js')

      assert.throws(function () {
        tree.addDependant('does-not-exist', a)
      })
    })

    it('should support using string ids', function () {
      // a.js <- b.js
      let tree = new Tree()
      let a = tree.addFile('a.js')
      let b = tree.addFile('b.js')

      tree.addDependant(b.id, a.id)
      assert.isTrue(tree.hasDependant(b, a))
    })

    it('should fail when the child file is not in the tree', function () {
      let tree = new Tree()
      let child = 'does not exist'
      let parent = tree.addFile('b.js')

      assert.throws(() => tree.addDependant(child, parent), `cannot add dependant because ${child} is not in the tree`)
    })

    it('should fail when the parent file is not in the tree', function () {
      let tree = new Tree()
      let child = tree.addFile('a.js')
      let parent = 'does not exist'

      assert.throws(() => tree.addDependant(child, parent), `cannot add dependant because ${parent} is not in the tree`)
    })
  })

  describe('#removeDependant(child, parent)', function () {
    it('should remove the edge from the graph', function () {
      // a.js <- b.js
      let tree = new Tree()
      let a = tree.addFile('a.js')
      let b = tree.addFile('b.js')
      tree.addDependant(b, a)

      tree.removeDependant(b, a)
      assert.isFalse(tree.hasDependant(b, a))
    })

    it('should allow using string ids', function () {
      // a.js <- b.js
      let tree = new Tree()
      let a = tree.addFile('a.js')
      let b = tree.addFile('b.js')
      tree.addDependant(b, a)

      tree.removeDependant(b.id, a.id)
      assert.isFalse(tree.hasDependant(b, a))
    })

    it('should fail when the child file is not in the tree', function () {
      // a.js <- b.js
      let tree = new Tree()
      let a = tree.addFile('a.js')
      let b = tree.addFile('b.js')
      tree.addDependant(b, a)

      assert.throws(() => tree.removeDependant('does not exist', a), 'cannot remove dependant because does not exist is not in the tree')
    })

    it('should fail when the parent file is not in the tree', function () {
      // a.js <- b.js
      let tree = new Tree()
      let a = tree.addFile('a.js')
      let b = tree.addFile('b.js')
      tree.addDependant(b, a)

      assert.throws(() => tree.removeDependant(b, 'does not exist'), 'cannot remove dependant because does not exist is not in the tree')
    })
  })

  describe('#dependantsOf(file, [options])', function () {
    // a.js <- b.js <- c.js
    let tree = new Tree()
    let a = tree.addFile('a.js')
    let b = tree.addFile('b.js')
    let c = tree.addFile('c.js')
    tree.addDependency(a, b)
    tree.addDependency(b, c)

    it('should return the direct dependants of file', function () {
      assert.deepEqual(tree.dependantsOf(c), [ b ])
    })

    it('should support using a string id', function () {
      assert.deepEqual(tree.dependantsOf(c.id), [ b ])
    })

    context('with options', function () {
      context('.recursive', function () {
        it('should all the dependencies of file', function () {
          assert.deepEqual(tree.dependantsOf(c, { recursive: true }), [ b, a ])
        })

        it('should support using a string id', function () {
          assert.deepEqual(tree.dependantsOf(c.id, { recursive: true }), [ b, a ])
        })
      })
    })
  })

  describe('#size()', function () {
    // a.js <- b.js
    //      <- c.js
    let tree = new Tree()
    let a = tree.addFile('a.js')
    let b = tree.addFile('b.js')
    let c = tree.addFile('c.js')
    tree.addDependency(a, b)
    tree.addDependency(a, c)

    it('should return the number of files in the tree', function () {
      assert.strictEqual(tree.size(), 3)
    })
  })

  describe('#clone()', function () {
    // a.js <- b.js
    //      <- c.js
    let tree = new Tree('/some/root')
    let a = tree.addFile('a.js')
    let b = tree.addFile('b.js')
    let c = tree.addFile('c.js')
    tree.addDependency(a, b)
    tree.addDependency(a, c)

    it('should make a clone of the original', function () {
      let clone = tree.clone()

      assert.notStrictEqual(clone, tree)
      assert.instanceOf(clone, Tree)
      assert.strictEqual(clone.size(), tree.size())
      assert.deepEqual(clone.getFiles({ topological: true }), tree.getFiles({ topological: true }))
    })

    it('should preserve the root', function () {
      let clone = tree.clone()
      assert.strictEqual(clone.root, tree.root)
    })
  })

  describe('#prune(anchors)', function () {
    it('should remove all files disconnected from anchors', function () {
      // a* <- b
      // c
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      let c = tree.addFile('c')
      tree.addDependency(a, b)

      tree.prune([ a ])
      assert.strictEqual(tree.size(), 2)
      assert.isFalse(tree.hasFile(c))
    })

    it('should recursively remove orphaned trees', function () {
      // a* <- b
      // c  <- d
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      let c = tree.addFile('c')
      let d = tree.addFile('d')
      tree.addDependency(a, b)
      tree.addDependency(c, d)

      tree.prune([ a ])
      assert.strictEqual(tree.size(), 2)
      assert.isFalse(tree.hasFile(c))
      assert.isFalse(tree.hasFile(d))
    })

    it('should not remove dependencies that are still depended on elsewhere', function () {
      // a* <- b <- c
      // d  <-
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      let c = tree.addFile('c')
      let d = tree.addFile('d')
      tree.addDependency(a, b)
      tree.addDependency(b, c)
      tree.addDependency(d, b)

      tree.prune([ a ])
      assert.deepEqual(tree.getFiles({ topological: true }), [ c, b, a ])
    })

    it('should properly handle a complex case', function () {
      // a* <- b <- c <- d
      // e  <- f <-
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      let c = tree.addFile('c')
      let d = tree.addFile('d')
      let e = tree.addFile('e')
      let f = tree.addFile('f')
      tree.addDependency(a, b)
      tree.addDependency(b, c)
      tree.addDependency(c, d)
      tree.addDependency(e, f)
      tree.addDependency(f, c)

      tree.prune([ a ])
      assert.deepEqual(tree.getFiles({ topological: true }), [ d, c, b, a ])
    })

    it('should even work with shallow circular dependencies', function () {
      // a* <- b <-> c
      // d  <- e
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      let c = tree.addFile('c')
      let d = tree.addFile('d')
      let e = tree.addFile('e')
      tree.addDependency(a, b)
      tree.addDependency(b, c)
      tree.addDependency(c, b)
      tree.addDependency(d, e)

      tree.prune([ a ])
      assert.sameMembers(tree.getFiles(), [ a, b, c ])
    })

    it('should even work with deep circular dependencies', function () {
      // a <- b <- c <- d
      //        ------>
      // f <- e
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      let c = tree.addFile('c')
      let d = tree.addFile('d')
      let e = tree.addFile('e')
      let f = tree.addFile('f')
      tree.addDependency(a, b)
      tree.addDependency(b, c)
      tree.addDependency(c, d)
      tree.addDependency(d, b)
      tree.addDependency(f, e)

      tree.prune([ a ])
      assert.sameMembers(tree.getFiles(), [ a, b, c, d ])
    })
  })

  describe('#removeCycles()', function () {
    it('should remove shallow cycles', function () {
      // a <-> b
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      tree.addDependency(a, b)
      tree.addDependency(b, a) // should be removed

      tree.removeCycles()
      assert.doesNotThrow(() => tree.getFiles({ topological: true }))
    })

    it('should remove shallow cycles found deeper in the graph', function () {
      // a <- b <-> c
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      let c = tree.addFile('c')
      tree.addDependency(a, b)
      tree.addDependency(b, c)
      tree.addDependency(c, b)

      tree.removeCycles()
      assert.doesNotThrow(() => tree.getFiles({ topological: true }))
    })

    it('should remove large cycles in the graph', function () {
      // a <- b <- c <- d
      //        ------>
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      let c = tree.addFile('c')
      let d = tree.addFile('d')
      tree.addDependency(a, b)
      tree.addDependency(b, c)
      tree.addDependency(c, d)
      tree.addDependency(d, b)

      tree.removeCycles()
      assert.doesNotThrow(() => tree.getFiles({ topological: true }))
    })
  })

  describe('#toJSON()', function () {
    it('should return a list of vertices and edges for reconstructing the graph', function () {
      // a.js <- b.js
      let tree = new Tree()
      let a = tree.addFile('a.js')
      let b = tree.addFile('b.js')
      tree.addDependency(a, b)

      let json = tree.toJSON()
      assert.strictEqual(json.root, process.cwd())
      assert.deepEqual(json.files, [ a, b ])
      assert.deepEqual(json.dependencies, [
        [ b.id, a.id ]
      ])
    })

    it('should encode a root on the object', function () {
      let tree = new Tree('root')
      let json = tree.toJSON()
      assert.strictEqual(json.root, tree.root)
    })
  })

  describe('#toString([space])', function () {
    it('should completely stringify to JSON', function () {
      // a.js <- b.js
      let tree = new Tree()
      let a = tree.addFile('a.js')
      let b = tree.addFile('b.js')
      tree.addDependency(a, b)

      assert.strictEqual(tree.toString(), JSON.stringify({
        root: process.cwd(),
        files: [ a, b ],
        dependencies: [
          [ b.id, a.id ]
        ]
      }))
    })
  })

  describe('.fromString(input)', function () {
    it('should parse a JSON string into a tree instance', function () {
      // a <- b
      let tree = new Tree()
      let a = tree.addFile('a.js')
      a.contents = new Buffer('a')
      a.modified = new Date()
      let b = tree.addFile('b.js')
      b.contents = new Buffer('b')
      b.modified = new Date()
      tree.addDependency(a, b)

      let actual = Tree.fromString(tree.toString())
      assert.instanceOf(actual, Tree)
      assert.isTrue(actual.graph.equals(tree.graph, eqV, () => true))

      function eqV (a, b) {
        return a.path === b.path && bufferEqual(a.contents, b.contents) && dateEqual(a.modified, b.modified)
      }
    })

    it('should restore the root property', function () {
      let tree = new Tree('root')
      let actual = Tree.fromString(tree.toString())
      assert.strictEqual(actual.root, 'root')
    })
  })
})

function dateEqual (a, b) {
  assert.instanceOf(a, Date)
  assert.instanceOf(b, Date)
  return a.getTime() === b.getTime()
}
