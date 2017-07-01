
'use strict'

const arrify = require('arrify')
const debug = require('debug')('mako-stylus')
const compiler = require('stylus')
const utils = require('mako-utils')

const defaults = {
  extensions: 'styl',
  plugins: [],
  sourceMaps: false,
  sourceRoot: 'mako://'
}

module.exports = options => {
  debug('initialize %j', options)

  let config = Object.assign({}, defaults, options)

  return function (mako) {
    mako.postread(config.extensions, stylus)
  }

  function stylus (file, build, done) {
    const relative = utils.relative(file.path)
    debug('compiling %s', relative)
    let before = utils.size(file.contents, true)

    // set up stylus compiler
    let styl = compiler(file.contents.toString())
    styl.set('filename', file.path)
    arrify(config.plugins).forEach(plugin => styl.use(plugin))
    if (config.sourceMaps) {
      styl.set('sourcemap', {
        comment: false,
        inline: false,
        basePath: file.base,
        sourceRoot: config.sourceRoot
      })
    }

    // render the css
    styl.render((err, css) => {
      if (err) return done(err)

      file.type = 'css'
      file.contents = Buffer.from(css)
      if (config.sourceMaps) file.sourceMap = styl.sourcemap

      let after = utils.size(file.contents, true)
      debug('compiled %s %s', relative, utils.sizeDiff(before, after))
      done()
    })
  }
}
