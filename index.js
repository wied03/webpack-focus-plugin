'use strict'

const filterDependencies = require('./lib/filterDependencies')
const onlyFocusedParserPlugin = require('./lib/onlyFocusedParserPlugin')

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

FocusPlugin.prototype.apply = function(compiler) {
  const focusPatterns = this.focusPatterns
  var onlyFocused = null

  function getCustomResolveDependencies(focusPatterns, origFunc) {
    return function(fs, resource, recursive, regExp, callback) {
      origFunc(fs, resource, recursive, regExp, function(err, deps) {
        if (err) {
          return callback(err)
        }

        if (onlyFocused) {
          filterDependencies(fs, focusPatterns, resource, deps, callback)
        } else {
          callback(null, deps)
        }
      })
    }
  }

  // allows signaling focused only intent with require.onlyFocused() in entry files
  new onlyFocusedParserPlugin().apply(compiler.parser)
  const dependencyModules = []

  compiler.plugin('compilation', function(compilation) {
    function clearDependencyModuleCache() {
      // TODO: Way to clear out just this dependencies' cache without hard coding this?
      const cacheGroup = 'm'
      dependencyModules.forEach(mod => {
        var cacheKey = cacheGroup + mod.identifier()
        delete compilation.cache[cacheKey]
      })
    }

    compilation.plugin('succeed-module', function(module) {
      // there is a separate module from the entry point that actually contains the dependencies
      // from the entry point/context, that is what we want to filter
      const containsEntryDependencies = module.recursive
      // onlyFocusedSpecsRun is set from compiled/parse code in entry point
      const isEntryPoint = typeof module.onlyFocusedSpecsRun !== 'undefined'

      if (containsEntryDependencies) {
        dependencyModules.push(module)
      } else if (isEntryPoint && onlyFocused === null) {
        // first run
        onlyFocused = module.onlyFocusedSpecsRun
      } else if (isEntryPoint && onlyFocused != module.onlyFocusedSpecsRun) {
        // setting has changed
        onlyFocused = module.onlyFocusedSpecsRun
        clearDependencyModuleCache()
      }
    })
  })

  compiler.plugin('context-module-factory', function(cmf) {
    cmf.plugin('after-resolve', function(options, callback) {
      // allow us to intercept dependencies and remove some
      options.resolveDependencies = getCustomResolveDependencies(focusPatterns, options.resolveDependencies)
      return callback(null, options)
    })
  })
}

module.exports = FocusPlugin
