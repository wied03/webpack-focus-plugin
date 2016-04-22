'use strict'

const createFilteredFs = require('./lib/createFilteredFs')

function getCustomResolveDependencies(focusPatterns, origFunc) {
  return function resolveDependencies(fs, resource, recursive, regExp, callback) {
    const filterFs = createFilteredFs(fs, focusPatterns)
    return origFunc(filterFs, resource, recursive, regExp, callback)
  }
}

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

FocusPlugin.prototype.apply = function(compiler) {
  const focusPatterns = this.focusPatterns
  compiler.plugin('context-module-factory', function(cmf) {
    cmf.plugin('after-resolve', function(options, callback) {
      options.resolveDependencies = getCustomResolveDependencies(focusPatterns, options.resolveDependencies)
      return callback(null, options)
    })
  })
}

module.exports = FocusPlugin
