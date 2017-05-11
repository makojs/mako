/* eslint-env mocha */

'use strict'

const cache = require('..')

afterEach(function () {
  return cache.clear()
})

describe('load', function () {
  require('./spec/load').forEach(function (spec) {
    it(spec.description, function () {
      if (spec.tree) cache.saveSync(spec.tree)

      return cache.load(spec.params).then(spec.expected)
    })

    it(spec.description + ' (sync)', function () {
      if (spec.tree) cache.saveSync(spec.tree)

      let tree = cache.loadSync(spec.params)
      if (spec.expected) spec.expected(tree)
    })
  })
})

describe('save', function () {
  require('./spec/save').forEach(function (spec) {
    it(spec.description, function () {
      return cache.save(spec.params).then(spec.expected)
    })

    it(spec.description + ' (sync)', function () {
      let file = cache.saveSync(spec.params)
      if (spec.expected) spec.expected(file)
    })
  })
})

describe('clear', function () {
  require('./spec/clear').forEach(function (spec) {
    it(spec.description, function () {
      if (spec.trees) spec.trees.forEach(tree => cache.saveSync(tree))

      return cache.clear(spec.params).then(spec.expected)
    })

    it(spec.description + ' (sync)', function () {
      if (spec.trees) spec.trees.forEach(tree => cache.saveSync(tree))

      let file = cache.clearSync(spec.params)
      if (spec.expected) spec.expected(file)
    })
  })
})
