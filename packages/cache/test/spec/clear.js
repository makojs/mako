
'use strict'

const assert = require('chai').assert
const fs = require('fs')
const Tree = require('mako-tree')
const utils = require('../../lib/utils')

const tree1 = new Tree('/a')
const tree2 = new Tree('/b')

module.exports = [
  {
    trees: [ tree1, tree2 ],
    description: 'should return the absolute path to what was deleted',
    expected: function (file) {
      assert.equal(file, utils.dir())
    }
  },
  {
    trees: [ tree1, tree2 ],
    description: 'should delete the files from disk',
    expected: function (file) {
      assert.isFalse(fs.existsSync(utils.filename(tree1.root)))
      assert.isFalse(fs.existsSync(utils.filename(tree2.root)))
    }
  },
  {
    trees: [ tree1, tree2 ],
    description: 'should only delete a specified project cache file',
    params: tree1.root,
    expected: function (file) {
      assert.isFalse(fs.existsSync(utils.filename(tree1.root)))
      assert.isTrue(fs.existsSync(utils.filename(tree2.root)))
    }
  }
]
