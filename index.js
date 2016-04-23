'use strict'

const filterDependencies = require('./lib/filterDependencies')

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

var ConstDependency = require("webpack/lib/dependencies/ConstDependency");
var NullFactory = require("webpack/lib/NullFactory");

function getCustomResolveDependencies(focusPatterns, origFunc) {
  return function(fs, resource, recursive, regExp, callback) {
    origFunc(fs, resource, recursive, regExp, function(err, deps) {
      if (err) { return callback(err) }

      filterDependencies(fs, focusPatterns, resource, deps, callback)
    })
  }
}

FocusPlugin.prototype.apply = function(compiler) {
  const focusPatterns = this.focusPatterns
  var onlyFocused = null
  const dependencyModules = []

  // allows signaling focused only intent with require.onlyFocused() in entry files
  compiler.parser.plugin("call onlyFocused", function(expr) {
    this.state.current.onlyFocusedSpecsRun = expr.arguments[0].value
    // only here to ensure 'onlyFocused' doesn't actually get executed
    var dep = new ConstDependency('/* onlyFocused tests */', expr.range);
    dep.loc = expr.loc;
    this.state.current.addDependency(dep)
    return true
  })

  compiler.plugin("compilation", function(compilation) {
    compilation.dependencyFactories.set(ConstDependency, new NullFactory());
    compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

    compilation.plugin('succeed-module', function(module) {
      const containsEntryDependencies = module.recursive
      const filesystem = compiler.inputFileSystem

      // ideally we'd clean up dependencies right here, but most of these module hooks are not async
      if (containsEntryDependencies) {
        // TODO: Now that this is considered a dependency, maybe we can remove the caching code??
        module.cacheable = true
        dependencyModules.push(module)
      }
      else {
        if (typeof module.onlyFocusedSpecsRun !== 'undefined') {
          if (onlyFocused === null) {
            onlyFocused = module.onlyFocusedSpecsRun
          }
        }
        else if (onlyFocused != module.onlyFocusedSpecsRun) {
          // focus was on and was turned off, need to force a reload to get our dependencies back
          dependencyModules.forEach(mod => mod.cacheable = false)
          onlyFocused = module.onlyFocusedSpecsRun
        }
      }
    });
  });

  compiler.plugin('context-module-factory', function(cmf) {
    cmf.plugin('after-resolve', function(options, callback) {
      if (onlyFocused) {
        // allow us to intercept dependencies and remove some
        options.resolveDependencies = getCustomResolveDependencies(focusPatterns, options.resolveDependencies)
      }
      return callback(null, options)
    })
  })
}

module.exports = FocusPlugin
