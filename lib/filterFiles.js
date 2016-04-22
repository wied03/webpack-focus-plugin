'use strict'

const path = require('path')

// TODO: Support filtering across multiple contexts, this only works within a context
module.exports = function(fs, ignorePatterns, directory, files, callback) {
  const focusedFiles = []
  const directories = []

  const allDone = function() {
    console.log("all done, focused files")
    console.dir(focusedFiles)
    console.log("all done, dir")
    console.dir(directories)
    const result = focusedFiles.length > 0 ? directories.concat(focusedFiles) : files
    console.log('returning filtered list of')
    console.dir(result)
    return callback(null, result)
  }

  const wrapUpCallback = function(index) {
    if (index == files.length - 1) {
      allDone()
    }
  }

  files.forEach(function(file, index) {
    console.log(`evaluating file ${file}`)
    var fullPath = path.join(directory, file)
    fs.stat(fullPath, function(err, stat) {
      if (err) return callback(err);

      if (stat.isDirectory()) {
        directories.push(file)
        wrapUpCallback(index) // these get handled recursively anyways
      } else {
        fs.readFile(fullPath, function(err, data) {
          if (err) {
            return callback(err)
          }

          var fileContents = data.toString()

          if (ignorePatterns.find(pat => pat.test(fileContents))) {
            focusedFiles.push(file)
          }
          wrapUpCallback(index)
        })
      }
    })
  })
}
