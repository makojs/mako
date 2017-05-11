/* eslint-env mocha */

'use strict'

let Build = require('../lib/build')
let Promise = require('bluebird')
let chai = require('chai')
let Runner = require('../lib/runner')
let Tree = require('mako-tree')
let path = require('path')

chai.use(require('chai-as-promised'))
let assert = chai.assert
let fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('Runner([options])', function () {
  it('should be a constructor function', function () {
    assert.instanceOf(new Runner(), Runner)
  })

  it('should allow setting a predefined tree', function () {
    let tree = new Tree()
    let runner = new Runner({ tree: tree })
    assert.strictEqual(runner.tree, tree)
  })

  it('should set up the tree with the given root', function () {
    let runner = new Runner({ root: 'root' })
    assert.strictEqual(runner.tree.root, 'root')
  })

  it('should set the concurrency option', function () {
    let runner = new Runner({ concurrency: 25 })
    assert.strictEqual(runner.concurrency, 25)
  })

  it('should add default plugins', function () {
    let called = false
    let plugins = function (mako) {
      called = true
    }
    let runner = new Runner({ plugins: plugins })
    assert.isDefined(runner)
    assert.isTrue(called)
  })

  // parse file hooks
  ;[ 'preread', 'read', 'postread', 'predependencies', 'dependencies' ].forEach(function (hook) {
    describe(`#${hook}(type, handler)`, function () {
      it('should be called upon during parse', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook]('txt', file => called.push(file.path))

        return mako.parse(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should only be called on the file type specified', function () {
        let called = []
        let mako = new Runner()

        mako[hook]('txt', file => called.push(file.type))
        mako[hook]('js', file => called.push(file.type))

        return mako.parse(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ 'txt' ])
        })
      })

      it('should call the handlers in the order they were defined', function () {
        let called = []
        let mako = new Runner()

        mako[hook]('txt', () => called.push(1))
        mako[hook]('txt', () => called.push(2))

        return mako.parse(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ 1, 2 ])
        })
      })

      it('should allow async callback handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook]('txt', function (file, build, done) {
          process.nextTick(function () {
            called.push(file.path)
            done()
          })
        })

        return mako.parse(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should allow async generator handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook]('txt', function * (file) {
          yield Promise.fromCallback(function (done) {
            called.push(file.path)
            process.nextTick(done)
          })
        })

        return mako.parse(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should allow async promise handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook]('txt', function (file) {
          return Promise.fromCallback(function (done) {
            called.push(file.path)
            process.nextTick(done)
          })
        })

        return mako.parse(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should run async handlers in order', function () {
        let called = []
        let mako = new Runner()

        mako[hook]('txt', function (file, build, done) {
          called.push(1)
          setTimeout(done, 25)
        })

        mako[hook]('txt', function (file, build, done) {
          process.nextTick(function () {
            called.push(2)
            done()
          })
        })

        return mako.parse(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ 1, 2 ])
        })
      })

      it('should receive the entry file as an argument', function () {
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook]('txt', function (file) {
          assert.equal(file.path, entry)
        })

        return mako.parse(entry)
      })

      it('should receive a build instance as an argument', function () {
        let mako = new Runner()

        mako[hook]('txt', function (file, build) {
          assert.instanceOf(build, Build)
        })

        return mako.parse(fixture('text/a.txt'))
      })

      it('should support multiple extensions', function () {
        let called = []
        let mako = new Runner()
        let a = fixture('text/a.txt')
        let b = fixture('text/b.md')

        mako[hook]([ 'txt', 'md' ], function (file) {
          called.push([ file.path, file.type ])
        })

        return mako.parse(a, b).then(function () {
          assert.deepEqual(called, [ [ a, 'txt' ], [ b, 'md' ] ])
        })
      })

      it('should not leave the parsing flag on when an error is thrown (#7)', function () {
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        let tree = mako.tree

        mako[hook]('txt', function () {
          throw new Error('fail')
        })

        return mako.parse(entry).catch(function () {
          let file = tree.findFile(entry)
          assert.isFalse(file.parsing)
        })
      })
    })
  })

  // compile file hooks
  ;[ 'postdependencies', 'prewrite', 'write', 'postwrite' ].forEach(function (hook) {
    describe(`#${hook}(type, handler)`, function () {
      it('should be called during compile', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]('txt', file => called.push(file.path))

        return mako.compile(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should only be called on the file type specified', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]([ 'txt', 'js' ], file => called.push(file.path))

        return mako.compile(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should call the handlers in the order they were defined', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]('txt', () => called.push(1))
        mako[hook]('txt', () => called.push(2))

        return mako.compile(entry).then(function () {
          assert.deepEqual(called, [ 1, 2 ])
        })
      })

      it('should allow async callback handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]('txt', function (file, build, done) {
          called.push(file.path)
          process.nextTick(done)
        })

        return mako.compile(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should allow async generator handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]('txt', function * (file) {
          yield Promise.fromCallback(function (done) {
            called.push(file.path)
            process.nextTick(done)
          })
        })

        return mako.compile(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should allow async promise handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]('txt', function (file) {
          return Promise.fromCallback(function (done) {
            called.push(file.path)
            process.nextTick(done)
          })
        })

        return mako.compile(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should run async handlers in order', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]('txt', function (file, build, done) {
          setTimeout(function () {
            called.push(1)
            done()
          }, 25)
        })

        mako[hook]('txt', function (file, build, done) {
          process.nextTick(function () {
            called.push(2)
            done()
          })
        })

        return mako.compile(entry).then(function () {
          assert.deepEqual(called, [ 1, 2 ])
        })
      })

      it('should receive the entry file as an argument', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]('txt', file => called.push(file.path))

        return mako.compile(entry).then(function () {
          assert.deepEqual(called, [ entry ])
        })
      })

      it('should receive a build instance as an argument', function () {
        let mako = new Runner()
        let entry = fixture('text/a.txt')
        mako.tree.addFile(entry)

        mako[hook]('txt', function (file, build) {
          assert.instanceOf(build, Build)
        })

        return mako.compile(entry)
      })
    })
  })

  // build hooks
  ;[ 'preparse', 'postparse', 'precompile', 'postcompile' ].forEach(function (hook) {
    context(hook, function () {
      it('should be called upon during parse', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook](() => called.push(1))

        return mako.build(entry).then(function () {
          assert.deepEqual(called, [ 1 ])
        })
      })

      it('should call the handlers in the order they were defined', function () {
        let called = []
        let mako = new Runner()

        mako[hook](() => called.push(1))
        mako[hook](() => called.push(2))

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ 1, 2 ])
        })
      })

      it('should allow async callback handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook](function (build, done) {
          process.nextTick(function () {
            called.push(1)
            done()
          })
        })

        return mako.build(entry).then(function () {
          assert.deepEqual(called, [ 1 ])
        })
      })

      it('should allow async generator handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook](function * () {
          yield Promise.fromCallback(function (done) {
            called.push(1)
            process.nextTick(done)
          })
        })

        return mako.build(entry).then(function () {
          assert.deepEqual(called, [ 1 ])
        })
      })

      it('should allow async promise handlers', function () {
        let called = []
        let mako = new Runner()
        let entry = fixture('text/a.txt')

        mako[hook](function () {
          return Promise.fromCallback(function (done) {
            called.push(1)
            process.nextTick(done)
          })
        })

        return mako.build(entry).then(function () {
          assert.deepEqual(called, [ 1 ])
        })
      })

      it('should run async handlers in order', function () {
        let called = []
        let mako = new Runner()

        mako[hook](function (build, done) {
          setTimeout(function () {
            called.push(1)
            done()
          }, 25)
        })

        mako[hook](function (build, done) {
          process.nextTick(function () {
            called.push(2)
            done()
          })
        })

        return mako.build(fixture('text/a.txt')).then(function () {
          assert.deepEqual(called, [ 1, 2 ])
        })
      })

      it('should receive a build instance as an argument', function () {
        let mako = new Runner()

        mako[hook](function (build) {
          assert.instanceOf(build, Build)
        })

        return mako.build(fixture('text/a.txt'))
      })
    })
  })

  describe('#use(...plugins)', function () {
    it('should pass a function the build instance', function () {
      let mako = new Runner()
      let called = false
      mako.use(function (build) {
        called = true
        assert.strictEqual(build, mako)
      })
      assert.isTrue(called)
    })

    it('should flatten the arguments into a single list', function () {
      let called = []
      let mako = new Runner()

      mako.use(plugin1, [ plugin2, [ plugin3 ] ])
      assert.deepEqual(called, [ 'plugin1', 'plugin2', 'plugin3' ])

      function plugin1 (build) {
        called.push('plugin1')
        assert.strictEqual(build, mako)
      }

      function plugin2 (build) {
        called.push('plugin2')
        assert.strictEqual(build, mako)
      }

      function plugin3 (build) {
        called.push('plugin3')
        assert.strictEqual(build, mako)
      }
    })

    it('should be chainable', function () {
      let mako = new Runner()
      assert.strictEqual(mako.use(plugin), mako)

      function plugin () {}
    })
  })

  describe('#parse(...entries)', function () {
    it('should return a Promise', function () {
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      assert.instanceOf(mako.parse(entry), Promise)
    })

    it('should require the entry argument', function () {
      let mako = new Runner()
      return assert.isRejected(mako.parse(), 'an entry file is required')
    })

    it('should resolve with a build instance', function () {
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      return assert.eventually.instanceOf(mako.parse(entry), Build)
    })

    it('should support passing entry objects', function () {
      let mako = new Runner()
      let path = fixture('text/a.txt')

      return mako.build({ path })
    })

    it('should call the hooks in order', function () {
      let called = []
      let mako = new Runner()

      ;[ 'preparse', 'postparse' ].forEach(hook => {
        mako[hook](() => called.push(hook))
      })

      ;[ 'preread', 'read', 'postread', 'predependencies', 'dependencies' ].forEach(hook => {
        mako[hook]('txt', () => called.push(hook))
      })

      return mako.parse(fixture('text/a.txt')).then(function () {
        assert.deepEqual(called, [ 'preparse', 'preread', 'read', 'postread', 'predependencies', 'dependencies', 'postparse' ])
      })
    })

    it('should use the original type for the preread hook', function () {
      let called = []
      let mako = new Runner()
      let entry = fixture('jade/index.jade')

      mako.preread('jade', function () {
        called.push('preread')
      })

      mako.postread('jade', function (file) {
        called.push('postread')
        file.type = 'html' // mock transpile
      })

      mako.dependencies('html', function () {
        called.push('dependencies')
      })

      return mako.parse(entry).then(function () {
        return mako.parse(entry).then(function () {
          assert.deepEqual(called, [ 'preread', 'postread', 'dependencies', 'preread' ])
        })
      })
    })

    it('should share the arguments between the read/dependency hooks', function () {
      let mako = new Runner()
      let args

      mako.preread('txt', function (file, build) {
        args = [ file, build ]
      })

      mako.read('txt', check)
      mako.postread('txt', check)
      mako.predependencies('txt', check)
      mako.dependencies('txt', check)

      return mako.parse(fixture('text/a.txt'))

      function check (file, build) {
        assert.strictEqual(file, args[0])
        assert.strictEqual(build, args[1])
      }
    })

    it('should recurse into any dependencies added during the dependencies hook', function () {
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      let dep = fixture('text/b.txt')
      let processed = []

      mako.read('txt', function (file) {
        processed.push(file.path)
      })

      mako.dependencies('txt', function (file, build) {
        if (file.path === entry) file.addDependency(build.tree.addFile(dep))
      })

      return mako.parse(entry).then(function () {
        assert.deepEqual(processed, [ entry, dep ])
      })
    })

    it('should not go into an infinite loop for circular dependencies', function () {
      // circular: a -> b -> c -> b
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      let dep1 = fixture('text/b.txt')
      let dep2 = fixture('text/c.txt')
      let processed = []

      mako.dependencies('txt', function (file, build) {
        processed.push(file.path)
        if (file.path === entry) {
          file.addDependency(build.tree.addFile(dep1))
        } else if (file.path === dep1) {
          file.addDependency(build.tree.addFile(dep2))
        } else if (file.path === dep2) {
          file.addDependency(build.tree.findFile(dep1)) // circular
        }
      })

      return mako.parse(entry).then(function () {
        assert.deepEqual(processed, [ entry, dep1, dep2 ])
      })
    })

    it('should re-parse deep files marked as dirty', function () {
      let mako = new Runner()
      let a = fixture('text/a.txt')
      let b = fixture('text/b.txt')
      let c = fixture('text/c.txt')
      let processed = []

      mako.read('txt', function (file) {
        processed.push(file.path)
      })

      mako.dependencies('txt', function (file, build) {
        if (file.path === a) {
          file.addDependency(build.tree.addFile(b))
        } else if (file.path === b) {
          file.addDependency(build.tree.addFile(c))
        }
      })

      return mako.parse(a)
        .then(build => build.dirty(build.tree.findFile(c)))
        .then(() => mako.parse(a))
        .then(() => assert.deepEqual(processed, [ a, b, c, c ]))
    })

    it('should always preread files during different builds', function () {
      let mako = new Runner()
      let a = fixture('text/a.txt')
      let b = fixture('text/b.txt')
      let c = fixture('text/c.txt')
      let processed = []

      mako.preread('txt', function (file, build) {
        if (file.path === c) build.dirty(file)
        processed.push(file.path)
      })

      mako.dependencies('txt', function (file, build) {
        if (file.path === a) {
          file.addDependency(build.tree.addFile(b))
        } else if (file.path === b) {
          file.addDependency(build.tree.addFile(c))
        }
      })

      return mako.parse(a)
        .then(() => mako.parse(a))
        .then(() => assert.deepEqual(processed, [ a, b, c, a, b, c ]))
    })

    it('should reset the file contents when marked as dirty', function () {
      let mako = new Runner()
      let a = fixture('text/a.txt')
      let before = []
      let after = []

      mako.preread('txt', function (file, build) {
        before.push(file.contents)
        build.dirty(file)
        after.push(file.contents)
      })

      mako.read('txt', function (file, build) {
        file.contents = Buffer.from('hello world')
      })

      return mako.parse(a)
        .then(() => mako.parse(a))
        .then(() => {
          assert.deepEqual(before, [ null, Buffer.from('hello world') ])
          assert.deepEqual(after, [ null, null ])
        })
    })

    context('in parallel', function () {
      [ 'preread', 'read', 'postread', 'predependencies', 'dependencies' ].forEach(function (hook) {
        context(hook, function () {
          it(`should not call the ${hook} hook multiple times`, function () {
            let mako = new Runner()
            let entry = fixture('text/a.txt')
            let processed = []

            mako[hook]('txt', function (file, build, done) {
              processed.push(file.path)
              process.nextTick(done)
            })

            return Promise.all([
              mako.parse(entry),
              mako.parse(entry)
            ]).then(function () {
              assert.deepEqual(processed, [ entry ])
            })
          })
        })
      })
    })

    context('in serial', function () {
      context('preread', function () {
        it('should always call the preread hook', function () {
          let mako = new Runner()
          let entry = fixture('text/a.txt')
          let processed = []

          mako.preread('txt', function (file) {
            processed.push(file.path)
          })

          return mako.parse(entry)
            .then(() => mako.parse(entry))
            .then(() => assert.deepEqual(processed, [ entry, entry ]))
        })
      })

      ;[ 'read', 'postread', 'predependencies', 'dependencies' ].forEach(function (hook) {
        context(hook, function () {
          it(`should not call the ${hook} hook each time`, function () {
            let mako = new Runner()
            let entry = fixture('text/a.txt')
            let processed = []

            mako[hook]('txt', function (file) {
              processed.push(file.path)
            })

            return mako.parse(entry)
              .then(() => mako.parse(entry))
              .then(() => assert.deepEqual(processed, [ entry ]))
          })

          it(`should call the ${hook} hook if the preread hook marks file as dirty`, function () {
            let mako = new Runner()
            let entry = fixture('text/a.txt')
            let processed = []

            mako.preread('txt', function (file, build) {
              build.dirty(file)
            })

            mako[hook]('txt', function (file) {
              processed.push(file.path)
            })

            return mako.parse(entry)
              .then(() => mako.parse(entry))
              .then(() => assert.deepEqual(processed, [ entry, entry ]))
          })
        })
      })
    })
  })

  describe('#compile(...entries)', function () {
    it('should return a Promise', function () {
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      assert.instanceOf(mako.compile(entry), Promise)
    })

    it('should require the entry argument', function () {
      let mako = new Runner()
      return assert.isRejected(mako.compile(), 'an entry file is required')
    })

    it('should resolve with a build instance', function () {
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      mako.tree.addFile(entry)
      return assert.eventually.instanceOf(mako.compile(entry), Build)
    })

    it('should support passing entry objects', function () {
      let mako = new Runner()
      let path = fixture('text/a.txt')
      mako.tree.addFile(path)
      return mako.compile({ path })
    })
  })

  describe('#build(...entries)', function () {
    it('should return a Promise', function () {
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      assert.instanceOf(mako.build(entry), Promise)
    })

    it('should require the entry argument', function () {
      let mako = new Runner()
      return assert.isRejected(mako.build(), 'an entry file is required')
    })

    it('should resolve with a build instance', function () {
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      return assert.eventually.instanceOf(mako.build(entry), Build)
    })

    it('should support passing entry objects', function () {
      let mako = new Runner()
      let path = fixture('text/a.txt')

      return mako.build({ path })
    })

    it('should call postdependencies in topological order (not in parallel)', function () {
      // a -> b -> c
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      let dep1 = fixture('text/b.txt')
      let dep2 = fixture('text/c.txt')
      let processed = []

      mako.dependencies('txt', function (file, build) {
        if (file.path === entry) {
          file.addDependency(build.tree.addFile(dep1))
        } else if (file.path === dep1) {
          file.addDependency(build.tree.addFile(dep2))
        }
      })

      mako.postdependencies('txt', function (file, build, done) {
        // each one is staggered differently to test race conditions. if
        // these were kicked off in parallel (what we don't want) then
        // the order would be incorrect.
        if (file.path === entry) {
          setTimeout(finish, 1)
        } else if (file.path === dep1) {
          setTimeout(finish, 10)
        } else {
          setTimeout(finish, 25)
        }

        function finish () {
          processed.push(file.path)
          done()
        }
      })

      return mako.build(entry).then(function () {
        assert.deepEqual(processed, [ dep2, dep1, entry ])
      })
    })

    it('should call the hooks in order', function () {
      let called = []
      let mako = new Runner()

      ;[ 'precompile', 'postcompile' ].forEach(hook => {
        mako[hook](() => called.push(hook))
      })

      ;[ 'postdependencies', 'prewrite', 'write', 'postwrite' ].forEach(hook => {
        mako[hook]('txt', () => called.push(hook))
      })

      return mako.build(fixture('text/a.txt')).then(function () {
        assert.deepEqual(called, [ 'precompile', 'postdependencies', 'prewrite', 'write', 'postwrite', 'postcompile' ])
      })
    })

    it('should share the arguments between the file hooks', function () {
      let mako = new Runner()
      let args

      mako.prewrite('txt', function (file, build) {
        args = [ file, build ]
      })
      mako.write('txt', check)
      mako.postwrite('txt', check)

      return mako.build(fixture('text/a.txt'))

      function check (file, build) {
        assert.strictEqual(file, args[0])
        assert.strictEqual(build, args[1])
      }
    })

    it('should continue processing files added during prewrite hooks', function () {
      let tree = new Tree()
      tree.addFile(fixture('text/a.txt'))

      let mako = new Runner(tree)
      let processed = []

      mako.prewrite('txt', function (file, build) {
        if (file.basename === 'a.txt') file.addDependency(build.tree.addFile(fixture('text/b.txt')))
        if (file.basename === 'b.txt') file.addDependency(build.tree.addFile(fixture('text/c.txt')))
        processed.push(file.basename)
      })

      return mako.build(fixture('text/a.txt')).then(function () {
        assert.deepEqual(processed, [ 'a.txt', 'b.txt', 'c.txt' ])
      })
    })

    it('should call hooks for all defined dependencies', function () {
      // a -> b -> c -> b* (circular)
      let mako = new Runner()
      let entry = fixture('text/a.txt')
      let dep1 = fixture('text/b.txt')
      let dep2 = fixture('text/c.txt')
      let processed = []

      mako.dependencies('txt', function (file, build) {
        processed.push(file.path)
        if (file.path === entry) {
          file.addDependency(build.tree.addFile(dep1))
        } else if (file.path === dep1) {
          file.addDependency(build.tree.addFile(dep2))
        } else if (file.path === dep2) {
          file.addDependency(build.tree.findFile(dep1)) // circular
        }
      })

      return mako.parse(entry).then(function () {
        assert.deepEqual(processed, [ entry, dep1, dep2 ])
      })
    })

    it('should resolve relative paths automatically (#64)', function () {
      let mako = new Runner()
      return mako.build('./test/fixtures/text/a.txt').then(build => {
        let files = build.tree.getFiles().map(file => file.path)
        assert.deepEqual(files, [ fixture('text/a.txt') ])
      })
    })

    it('should resolve relative paths based on configured root', function () {
      let mako = new Runner({ root: fixture('text') })
      return mako.build('./a.txt').then(build => {
        let files = build.tree.getFiles().map(file => file.path)
        assert.deepEqual(files, [ fixture('text/a.txt') ])
      })
    })

    it('should not hang the build tree is emptied during precompile (#65)', function () {
      let mako = new Runner()
      mako.precompile(build => {
        for (const file of build.tree.getFiles()) {
          build.tree.removeFile(file)
        }
      })
      return mako.build(fixture('text/a.txt'))
    })
  })
})
