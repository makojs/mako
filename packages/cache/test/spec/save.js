
'use strict'

const assert = require('chai').assert
const fs = require('fs')
const Tree = require('mako-tree')
const utils = require('../../lib/utils')

const tree1 = new Tree()     // pwd
const tree2 = new Tree('/')  // root

module.exports = [
  {
    description: 'should return the absolute path to the cache file',
    params: tree1,
    expected: function (file) {
      assert.equal(file, utils.filename(tree1.root))
    }
  },
  {
    description: 'should write the file to disk',
    params: tree1,
    expected: function (file) {
      assert.isTrue(fs.existsSync(file))
    }
  },
  {
    description: 'should change the output location with the tree root',
    params: tree2,
    expected: function (file) {
      assert.equal(file, utils.filename(tree2.root))
    }
  }
]
