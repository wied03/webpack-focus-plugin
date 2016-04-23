'use strict'

const filterDependencies = require('./lib/filterDependencies')
const onlyFocusedParserPlugin = require('./lib/onlyFocusedParserPlugin')

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

FocusPlugin.prototype.apply = function(compiler) {
  const focusPatterns = this.focusPatterns
  var onlyFocused = null
  const dependencyModules = []

  function getCustomResolveDependencies(focusPatterns, origFunc) {
    return function(fs, resource, recursive, regExp, callback) {
      origFunc(fs, resource, recursive, regExp, function(err, deps) {
        if (err) {
          return callback(err)
        }

        if (onlyFocused) {
          filterDependencies(fs, focusPatterns, resource, deps, callback)
        }
        else {
          callback(null, deps)
        }
      })
    }
  }

  // allows signaling focused only intent with require.onlyFocused() in entry files
  new onlyFocusedParserPlugin().apply(compiler.parser);

  compiler.plugin("compilation", function(compilation) {
    compilation.plugin('succeed-module', function(module) {
      const containsEntryDependencies = module.recursive
      const filesystem = compiler.inputFileSystem

      if (containsEntryDependencies) {
        dependencyModules.push(module)
      } else {
        // ideally we'd clean up dependencies right here, but most of these module hooks are not async
        // TODO: remove nested IFS
        if (typeof module.onlyFocusedSpecsRun !== 'undefined') {
          if (onlyFocused === null) {
            console.log(`set only focused for first time to ${module.onlyFocusedSpecsRun}`)
            onlyFocused = module.onlyFocusedSpecsRun
          } else if (onlyFocused != module.onlyFocusedSpecsRun) {
            console.log(`only focused is ${onlyFocused}, module setting is ${module.onlyFocusedSpecsRun}`)
              // focus was on and was turned off
            onlyFocused = module.onlyFocusedSpecsRun
              // TODO: Extract into a function
            const cacheGroup = 'm'
            dependencyModules.forEach(mod => {
              var cacheKey = cacheGroup + mod.identifier()
              delete compilation.cache[cacheKey]
            })
          }
        }
      }
    });
  });

  compiler.plugin('context-module-factory', function(cmf) {
    cmf.plugin('after-resolve', function(options, callback) {
      console.log('after resolve running')
        //if (onlyFocused) {
        // allow us to intercept dependencies and remove some
      options.resolveDependencies = getCustomResolveDependencies(focusPatterns, options.resolveDependencies)
        //}
      return callback(null, options)
    })
  })
}

module.exports = FocusPlugin
