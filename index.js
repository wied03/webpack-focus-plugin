'use strict'

const createFilteredFs = require('./lib/createFilteredFs')

function getCustomResolveDependencies(ignorePatterns, origFunc) {
  return function resolveDependencies(fs, resource, recursive, regExp, callback) {
    const filterFs = createFilteredFs(fs, ignorePatterns)
    return origFunc(filterFs, resource, recursive, regExp, callback)
  }
}

function FocusPlugin(ignorePatterns) {
  this.ignorePatterns = ignorePatterns
}

FocusPlugin.prototype.apply = function(compiler) {
  const ignorePatterns = this.ignorePatterns
  compiler.plugin('context-module-factory', function(cmf) {
    cmf.plugin('after-resolve', function(options, callback) {
      options.resolveDependencies = getCustomResolveDependencies(ignorePatterns, options.resolveDependencies)
      return callback(null, options)
    })
  })
}

module.exports = FocusPlugin
