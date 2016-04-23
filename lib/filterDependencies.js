'use strict'

const path = require('path')

module.exports = function(fs, focusPatterns, dependencies, callback) {
  const depsToRemove = []

  function repeater(index) {
    if (index >= dependencies.length) {
      return callback(null, depsToRemove)
    }

    var dep = dependencies[index]
    var fullPath = path.join(dep.context, dep.loc)
    fs.readFile(fullPath, function(err, fileData) {
      if (err) { return callback(err) }

      const fileContents = fileData.toString()
      const found = focusPatterns.find(pat => pat.test(fileContents))
      if (!found) {
        depsToRemove.push(dep)
      }
      repeater(index+1)
    })
  }
  repeater(0)
}
