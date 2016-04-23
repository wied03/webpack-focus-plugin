'use strict'

const createFilteredFs = require('./lib/createFilteredFs')

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

const onlyFocusedParserPlugin = require('./lib/onlyFocusedParserPlugin')

FocusPlugin.prototype.apply = function(compiler) {
  // allows signaling focused with require.onlyFocused() in entry files
  new onlyFocusedParserPlugin().apply(compiler.parser);
  const focusPatterns = this.focusPatterns
  var onlyFocused = false

  compiler.plugin("compilation", function(compilation) {
    compilation.plugin('succeed-module', function(module) {
      const containsEntryDependencies = module.recursive
      const isEntryPoint = !module.issuer

      if (onlyFocused && containsEntryDependencies) {
        // TODO: Check each dependency for the file pattern and remove it from module.dependencies if it does not have them
        //console.dir(module)
        module.dependencies.forEach(dep => {
          console.log(`will examine dependency ${dep.loc} in directory ${module.context}`)
        })
      }
      else if (isEntryPoint) {
        if (module.onlyFocusedSpecsRun) {
          console.log('Enabled focus only specs!')
          onlyFocused = true
        }
      }
    });
  });

  // compiler.plugin('context-module-factory', function(cmf) {
  //   cmf.plugin('after-resolve', function(options, callback) {
  //     options.resolveDependencies = getCustomResolveDependencies(focusPatterns, options.resolveDependencies)
  //     return callback(null, options)
  //   })
  // })
}

module.exports = FocusPlugin
