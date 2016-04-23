'use strict'

const path = require('path')

module.exports = function(fs, focusPatterns, context, dependencies, callback) {
  const depsToKeep = []

  function repeater(index) {
    if (index >= dependencies.length) {
      return callback(null, depsToKeep)
    }

    var dep = dependencies[index]
    var fullPath = path.join(context, dep.request)

    fs.readFile(fullPath, function(err, fileData) {
      if (err) { return callback(err) }

      const fileContents = fileData.toString()
      const found = focusPatterns.find(pat => pat.test(fileContents))
      if (found) {
        depsToKeep.push(dep)
      }
      repeater(index+1)
    })
  }
  repeater(0)
}
