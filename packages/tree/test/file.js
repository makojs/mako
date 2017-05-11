/* eslint-env mocha */

'use strict'

let assert = require('chai').assert
let File = require('../lib/file')
let Tree = require('../lib/tree')

describe('File(params, tree)', function () {
  it('should be a constructor function', function () {
    assert.instanceOf(new File({ path: 'a.js' }), File)
  })

  it('should set the path property', function () {
    let path = 'a.js'
    let file = new File(path)
    assert.strictEqual(file.path, path)
  })

  it('should set the type property', function () {
    let path = 'a.js'
    let file = new File(path)
    assert.strictEqual(file.type, 'js')
  })

  it('should allow setting additional vinyl params', function () {
    let path = 'a.js'
    let base = '/path/to'
    let contents = new Buffer('hello world')
    let file = new File({ path, base, contents })
    assert.strictEqual(file.base, base)
    assert.strictEqual(file.contents.toString(), 'hello world')
  })

  it('should allow setting custom properties', function () {
    let path = 'a.js'
    let sourceMap = {}
    let file = new File({ path, sourceMap })
    assert.deepEqual(file.sourceMap, sourceMap)
  })

  it('should not preserving an id', function () {
    let path = 'a.js'
    let id = 'abc123'
    let file = new File({ path, id })
    assert.strictEqual(file.id, id)
  })

  describe('#hasPath(path)', function () {
    let file = new File('/path/to/a.coffee')
    file.type = 'js' // set new path, update history

    it('should return true if the file has the given path currently', function () {
      assert.isTrue(file.hasPath('/path/to/a.js'))
    })

    it('should return true if the file had the given path previously', function () {
      assert.isTrue(file.hasPath('/path/to/a.coffee'))
    })

    it('should return false if the path is not found', function () {
      assert.isFalse(file.hasPath('/some/other/file'))
    })
  })

  describe('#hasDependency(child)', function () {
    // a -> b
    let tree = new Tree()
    let a = tree.addFile('a')
    let b = tree.addFile('b')
    tree.addDependency(a, b)

    it('should return true file has the given child dependency', function () {
      assert.isTrue(a.hasDependency(b))
    })

    it('should return false if the file does not have the given child dependency', function () {
      assert.isFalse(a.hasDependency('does-not-exist'))
    })
  })

  describe('#addDependency(child)', function () {
    it('should add the dependency to the tree', function () {
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')

      a.addDependency(b)
      assert.isTrue(tree.hasFile(b))
    })
  })

  describe('#removeDependency(child)', function () {
    it('should remove the child as a dependency', function () {
      // a -> b
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      a.addDependency(b)

      a.removeDependency(b)
      assert.isFalse(tree.hasDependency(a, b))
    })
  })

  describe('#dependencies([options])', function () {
    // a -> b -> c -> d
    let tree = new Tree()
    let a = tree.addFile('a')
    let b = tree.addFile('b')
    let c = tree.addFile('c')
    let d = tree.addFile('d')
    a.addDependency(b)
    b.addDependency(c)
    c.addDependency(d)

    it('should return the direct descendents', function () {
      assert.deepEqual(b.dependencies(), [ c ])
    })

    context('with options', function () {
      context('.recursive', function () {
        it('should return the entire dependency chain', function () {
          assert.deepEqual(b.dependencies({ recursive: true }), [ c, d ])
        })
      })
    })
  })

  describe('#hasDependant(parent)', function () {
    // a <- b
    let tree = new Tree()
    let a = tree.addFile('a')
    let b = tree.addFile('b')
    tree.addDependant(b, a)

    it('should return true file has the given child dependency', function () {
      assert.isTrue(b.hasDependant(a))
    })

    it('should return false if the file does not have the given child dependency', function () {
      assert.isFalse(b.hasDependant('does-not-exist'))
    })
  })

  describe('#addDependant(parent)', function () {
    it('should add the parent as a new dependant', function () {
      // a <- b
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')

      b.addDependant(a)
      assert.isTrue(tree.hasDependant(b, a))
    })
  })

  describe('#removeDependant(parent)', function () {
    it('should remove the parent as a dependant', function () {
      // a <- b
      let tree = new Tree()
      let a = tree.addFile('a')
      let b = tree.addFile('b')
      b.addDependant(a)

      b.removeDependant(a)
      assert.isFalse(tree.hasDependant(b, a))
    })
  })

  describe('#dependants([options])', function () {
    // a -> b -> c -> d
    let tree = new Tree()
    let a = tree.addFile('a')
    let b = tree.addFile('b')
    let c = tree.addFile('c')
    let d = tree.addFile('d')
    a.addDependency(b)
    b.addDependency(c)
    c.addDependency(d)

    it('should return the direct descendents', function () {
      assert.deepEqual(c.dependants(), [ b ])
    })

    context('with options', function () {
      context('.recursive', function () {
        it('should return the entire dependency chain', function () {
          assert.deepEqual(c.dependants({ recursive: true }), [ b, a ])
        })
      })
    })
  })

  describe('#reset()', function () {
    it('should reset the path back to the initial', function () {
      let file = new File('index.jade')
      file.type = 'html'
      file.reset()
      assert.strictEqual(file.path, 'index.jade')
    })

    it('should set the contents to null', function () {
      let file = new File('index.jade')
      file.contents = new Buffer('hello world')
      file.reset()
      assert.isNull(file.contents)
    })
  })

  describe('#type', function () {
    context('get', function () {
      it('should return the extension of the path', function () {
        let file = new File('index.jade')
        assert.strictEqual(file.type, 'jade')
      })

      it('should keep updated as the path changes', function () {
        let file = new File('index.jade')
        file.path = 'index.html'
        assert.strictEqual(file.type, 'html')
      })

      it('should use the basename when it has no extension', function () {
        let file = new File('CNAME')
        assert.strictEqual(file.type, 'cname')
      })

      it('should only use the basename when determining extension', function () {
        let file = new File('example.com/CNAME')
        assert.strictEqual(file.type, 'cname')
      })
    })

    context('set', function () {
      it('should change the path', function () {
        let file = new File('index.jade')
        file.type = 'html'
        assert.strictEqual(file.path, 'index.html')
      })

      it('should update the history', function () {
        let file = new File('index.jade')
        file.type = 'html'
        assert.deepEqual(file.history, [ 'index.jade', 'index.html' ])
      })
    })
  })

  describe('#initialPath', function () {
    it('should return the original path', function () {
      let file = new File('index.jade')
      assert.strictEqual(file.initialPath, 'index.jade')
    })

    it('should return the original path even when it changes', function () {
      let file = new File('index.jade')
      file.type = 'html'
      assert.strictEqual(file.initialPath, 'index.jade')
    })
  })

  describe('#initialType', function () {
    it('should return the extension of the original path', function () {
      let file = new File('index.jade')
      assert.strictEqual(file.initialType, 'jade')
    })

    it('should return the original extension even when type is changed', function () {
      let file = new File('index.jade')
      file.type = 'html'
      assert.strictEqual(file.initialType, 'jade')
    })

    it('should not include the path when determining the extension', function () {
      let file = new File('example.com/CNAME')
      assert.strictEqual(file.initialType, 'cname')
    })
  })

  describe('#clone([tree])', function () {
    it('should return a new File instance', function () {
      let a = new File('a')
      assert.instanceOf(a.clone(), File)
    })

    it('should preserve the known properties', function () {
      let tree = new Tree()
      let a = new File('/path/to/index.jade', tree)
      a.type = 'html'
      let clone = a.clone()

      assert.strictEqual(clone.tree, tree)
      assert.strictEqual(clone.path, '/path/to/index.html')
      assert.deepEqual(clone.history, [ '/path/to/index.jade', '/path/to/index.html' ])
      assert.strictEqual(clone.cwd, process.cwd())
    })

    it('should preserve custom properties', function () {
      let a = new File('/path/to/index.jade')
      a.custom = 'value'
      let clone = a.clone()

      assert.strictEqual(clone.custom, 'value')
    })

    it('should deep clone complex properties', function () {
      let a = new File({
        path: 'a',
        contents: new Buffer('hello world')
      })
      let clone = a.clone()
      assert.notStrictEqual(a.history, clone.history)
      assert.deepEqual(a.history, clone.history)
      assert.notStrictEqual(a.contents, clone.contents)
    })

    it('should deep clone custom properties', function () {
      let a = new File({
        path: 'a',
        sourceMap: {}
      })
      let clone = a.clone()
      assert.notStrictEqual(a.sourceMap, clone.sourceMap)
      assert.deepEqual(a.sourceMap, clone.sourceMap)
    })

    context('with tree', function () {
      it('should reference the passed tree instead of the original', function () {
        let tree = new Tree()
        let a = new File('/path/to/index.jade', {})
        let clone = a.clone(tree)

        assert.strictEqual(clone.tree, tree)
      })
    })
  })

  describe('#copy(newPath, [options])', function () {
    it('should return a new File instance', function () {
      let serverJS = new File('/path/to/server.js')
      assert.instanceOf(serverJS.copy('./client.js'), File)
    })

    it('should make a deep clone', function () {
      let tree = new Tree()
      let serverJS = new File('/path/to/server.js', tree)
      serverJS.custom = 'value'
      let clientJS = serverJS.copy('./client.js')

      assert.strictEqual(clientJS.tree, tree)
      assert.strictEqual(clientJS.cwd, process.cwd())
      assert.strictEqual(clientJS.custom, 'value')
    })

    it('should set the new path relative to the current path', function () {
      let tree = new Tree()
      let serverJS = new File('/path/to/server.js', tree)
      let clientJS = serverJS.copy('./client.js')

      assert.strictEqual(clientJS.path, '/path/to/client.js')
      assert.deepEqual(clientJS.history, [ '/path/to/server.js', '/path/to/client.js' ])
    })

    it('should generate a new id', function () {
      let tree = new Tree()
      let serverJS = new File('/path/to/server.js', tree)
      let clientJS = serverJS.copy('./client.js')

      assert.notStrictEqual(serverJS.id, clientJS.id)
    })

    context('with options', function () {
      describe('.resetPath', function () {
        it('should reset path history for the new file', function () {
          let tree = new Tree()
          let serverJS = new File('/path/to/server.js', tree)
          let clientJS = serverJS.copy('./client.js', { resetPath: true })

          assert.strictEqual(clientJS.path, '/path/to/client.js')
          assert.deepEqual(clientJS.history, [ '/path/to/client.js' ])
        })
      })
    })
  })

  describe('#toJSON()', function () {
    it('should return a cloned object', function () {
      let a = new File('a')
      assert.notStrictEqual(a.toJSON(), a)
    })

    it('should preserve internal properties', function () {
      let a = new File('a')
      let actual = a.toJSON()
      assert.strictEqual(actual.path, 'a')
    })

    it('should preserve custom properties', function () {
      let a = new File('a')
      a.hello = 'world'
      let actual = a.toJSON()
      assert.strictEqual(actual.hello, 'world')
    })

    it('should strip out the tree property', function () {
      let a = new File('a')
      assert.isUndefined(a.toJSON().tree)
    })
  })

  describe('#toString()', function () {
    it('should return a string', function () {
      let a = new File('a')
      assert.isString(a.toString())
    })
  })

  describe('.fromObject(input, tree)', function () {
    it('should parse a JSON string into a file instance', function () {
      let file = new File('a.txt', null, true)

      let actual = File.fromObject(file.toJSON())
      assert.instanceOf(actual, File)
      assert.strictEqual(actual.path, 'a.txt')
      assert.strictEqual(actual.type, 'txt')
    })

    it('should properly handle date objects', function () {
      let now = new Date()
      let file = new File('a.txt', null, true)
      file.modified = now

      let actual = File.fromObject(file.toJSON())
      assert.instanceOf(actual.modified, Date)
      assert.strictEqual(actual.modified.getTime(), now.getTime())
    })

    it('should properly handle buffer objects', function () {
      let file = new File('a.txt', null, true)
      file.contents = new Buffer('hello world')

      let actual = File.fromObject(file.toJSON())
      assert.isTrue(Buffer.isBuffer(actual.contents))
      assert.strictEqual(actual.contents.toString(), 'hello world')
    })

    it('should set the tree property', function () {
      let tree = new Tree()
      let file = tree.addFile('a.txt', true)

      let actual = File.fromObject(file.toJSON(), tree)
      assert.strictEqual(actual.tree, tree)
    })
  })
})
