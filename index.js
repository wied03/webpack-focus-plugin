'use strict'

const filterDependencies = require('./lib/filterDependencies')

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

const onlyFocusedParserPlugin = require('./lib/onlyFocusedParserPlugin')

FocusPlugin.prototype.apply = function(compiler) {
  // allows signaling focused only intent with require.onlyFocused() in entry files
  new onlyFocusedParserPlugin().apply(compiler.parser);
  const focusPatterns = this.focusPatterns
  var onlyFocused = false

  compiler.plugin("compilation", function(compilation) {
    compilation.plugin('succeed-module', function(module) {
      console.log('module bldg')
      console.dir(module.building)
      const containsEntryDependencies = module.recursive
      const isEntryPoint = !module.issuer
      const filesystem = compiler.inputFileSystem

      if (onlyFocused && containsEntryDependencies) {

        filterDependencies(filesystem, focusPatterns, module.context, module.dependencies, function(err, removeDeps) {
          if (err) { return callback(err) }

          removeDeps.forEach(dep => {
            var index = module.dependencies.indexOf(dep)
            module.dependencies.slice(index, 1)
          })

          return callback(null, module)
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
}

module.exports = FocusPlugin
