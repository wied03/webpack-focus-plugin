'use strict'

const filterDependencies = require('./lib/filterDependencies')

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

const onlyFocusedParserPlugin = require('./lib/onlyFocusedParserPlugin')

function getCustomResolveDependencies(focusPatterns, origFunc) {
  return function(fs, resource, recursive, regExp, callback) {
    origFunc(fs, resource, recursive, regExp, function(err, deps) {
      if (err) { return callback(err) }

      filterDependencies(fs, focusPatterns, resource, deps, callback)
    })
  }
}

FocusPlugin.prototype.apply = function(compiler) {
  // allows signaling focused only intent with require.onlyFocused() in entry files
  new onlyFocusedParserPlugin().apply(compiler.parser);
  const focusPatterns = this.focusPatterns
  var onlyFocused = false

  compiler.plugin("compilation", function(compilation) {
    compilation.plugin('succeed-module', function(module) {
      const isEntryPoint = !module.issuer
      const filesystem = compiler.inputFileSystem

      // ideally we'd clean up dependencies right here, but most of these module hooks are not async
      if (isEntryPoint) {
        if (module.onlyFocusedSpecsRun) {
          console.log('Enabled focus only specs!')
          onlyFocused = true
        }
      }
    });
  });

  compiler.plugin('context-module-factory', function(cmf) {
    cmf.plugin('after-resolve', function(options, callback) {
      if (onlyFocused) {
        options.resolveDependencies = getCustomResolveDependencies(focusPatterns, options.resolveDependencies)
      }
      return callback(null, options)
    })
  })
}

module.exports = FocusPlugin
