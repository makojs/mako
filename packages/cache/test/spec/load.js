
'use strict'

const assert = require('chai').assert
const Tree = require('mako-tree')

const tree1 = new Tree()
const html = tree1.addFile('index.html')
const js = tree1.addFile('index.js')
const css = tree1.addFile('index.css')
html.addDependency(js)
html.addDependency(css)

const tree2 = new Tree('/')

module.exports = [
  {
    description: 'should return null no cache file exists',
    expected: function (tree) {
      assert.isNull(tree)
    }
  },
  {
    tree: tree1,
    description: 'should return the encoded tree',
    expected: function (tree) {
      assert.instanceOf(tree, Tree)
      assert.equal(tree.size(), 3)
    }
  },
  {
    tree: tree2,
    description: 'the cache location should change with the root',
    params: tree2.root
  }
]
