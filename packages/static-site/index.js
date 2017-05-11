
'use strict'

let browser = require('mako-browser')
let buffer = require('mako-buffer')
let clone = require('clone')
let debug = require('debug')('mako-static-site')
let meta = require('remarkable-meta')
let Mustache = require('mustache')
let path = require('path')
let pkg = require('./package.json')
let Remarkable = require('remarkable')
let stat = require('mako-stat')

module.exports = function (options) {
  debug('initialize %j', options)

  return function staticSite (mako) {
    mako.use(stat([ 'md', 'html' ]))
    mako.use(buffer([ 'md', 'html' ]))
    mako.use(markdown, layout)
    mako.use(browser())
  }
}

function markdown (mako) {
  mako.postread('md', function (file) {
    const md = new Remarkable()
    md.use(meta)
    const html = md.render(file.contents.toString())
    file.type = 'html'
    file.contents = new Buffer(html)
    file.metadata = clone(md.meta)
  })
}

function layout (mako) {
  mako.dependencies('html', function layout (file, build) {
    if (file.metadata && file.metadata.layout) {
      let layout = path.resolve(file.dirname, file.metadata.layout)
      let layoutFile = build.tree.getFile(layout)
      if (!layoutFile) layoutFile = build.tree.addFile({ path: layout, layout: true })
      file.addDependency(layoutFile)
    }
  })

  mako.postdependencies('html', function layout (file, build) {
    if (file.layout) {
      file.dependants().forEach(parent => {
        parent.contents = new Buffer(render(file, parent))
        build.tree.removeDependency(parent, file)
      })
      build.tree.removeFile(file)
    }
  })
}

function render (layoutFile, bodyFile) {
  let body = bodyFile.contents.toString()
  let layout = layoutFile.contents.toString()
  let data = Object.assign({ body: body, generator: clone(pkg) }, layoutFile.metadata, bodyFile.metadata)
  return Mustache.render(layout, data)
}
