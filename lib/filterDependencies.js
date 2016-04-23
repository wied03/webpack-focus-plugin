'use strict'

const path = require('path')

module.exports = function(fs, focusPatterns, context, dependencies, callback) {
  const depsToRemove = []

  function repeater(index) {
    if (index >= dependencies.length) {
      return callback(null, depsToRemove)
    }

    var dep = dependencies[index]
    var fullPath = path.join(context, dep.loc)
    console.log('ffff')
    console.dir(dep)
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
