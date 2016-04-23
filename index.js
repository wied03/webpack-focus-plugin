'use strict'

const filterDependencies = require('./lib/filterDependencies')

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

const onlyFocusedParserPlugin = require('./lib/onlyFocusedParserPlugin')

function getCustomResolveDependencies(focusPatterns, origFunc) {
  return function(fs, resource, recursive, regExp, callback) {
    console.log('custom resolve invoke')
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
  const dependencyModules = []

  compiler.plugin("compilation", function(compilation) {
    compilation.plugin('succeed-module', function(module) {
      console.log('rebuilding module '+module.resource)
      const isEntryPoint = !module.issuer
      const containsEntryDependencies = module.recursive
      const filesystem = compiler.inputFileSystem

      // ideally we'd clean up dependencies right here, but most of these module hooks are not async
      if (containsEntryDependencies) {
        module.cacheable = true
        dependencyModules.push(module)
      }
      else if (isEntryPoint) {
        if (onlyFocused && !module.onlyFocusedSpecsRun) {
          // focus was on and was turned off, need to force a reload
          dependencyModules.forEach(mod => mod.cacheable = false)
        }
        onlyFocused = module.onlyFocusedSpecsRun
      }
    });
  });

  compiler.plugin('context-module-factory', function(cmf) {
    cmf.plugin('after-resolve', function(options, callback) {
      if (onlyFocused) {
        console.log('only focused! replacing resolve deps')
        // allow us to intercept dependencies and remove some
        options.resolveDependencies = getCustomResolveDependencies(focusPatterns, options.resolveDependencies)
      }
      return callback(null, options)
    })
  })
}

module.exports = FocusPlugin
