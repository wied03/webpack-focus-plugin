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
  console.dir(compiler.config)

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
        console.dir(module.onlyFocusedSpecsRun)
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
