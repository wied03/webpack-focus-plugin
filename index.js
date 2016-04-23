'use strict'

const createFilteredFs = require('./lib/createFilteredFs')

function getCustomResolveDependencies(focusPatterns, origFunc) {
  return function resolveDependencies(fs, resource, recursive, regExp, callback) {
    const focusState = {
      focusFiles: []
    }
    const filterFs = createFilteredFs(focusState, fs, focusPatterns)
    return origFunc(filterFs, resource, recursive, regExp, callback)
  }
}

function FocusPlugin(focusPatterns) {
  this.focusPatterns = focusPatterns
}

const junk = require('./lib/metadata')

FocusPlugin.prototype.apply = function(compiler) {
  new junk().apply(compiler.parser);
  const focusPatterns = this.focusPatterns
  compiler.plugin("compilation", function(compilation) {
    compilation.plugin('succeed-module', function(module) {
      const containsEntryDependencies = module.recursive
      if (containsEntryDependencies) {
        //console.dir(module)
        module.dependencies.forEach(dep => {
          console.log(`will examine dependency ${dep.loc} in directory ${module.context}`)
        })
      }
      else if (module.resource === '/Users/brady/code/Ruby/opal/repos_NOCRASHPLAN/webpack-focus-plugin/test/fixtures/entry_mult_context.js') {
        console.log('fooooooo!')
        console.dir(module._source._value)
        //console.dir(module)
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
