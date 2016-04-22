'use strict'

const path = require('path')

// TODO: Support filtering across multiple contexts, this only works within a context
module.exports = function (fs, ignorePatterns, directory, files, callback) {
  const focusedFiles = []

  const allDone = function() {
    const result = focusedFiles.length > 0 ? focusedFiles : files
    return callback(null, result)
  }

  files.forEach(function(file, index) {
    var fullPath = path.join(directory, file)
    fs.readFile(fullPath, function(err, data) {
      if (err) {
        return callback(err)
      }

      var fileContents = data.toString()

      if (ignorePatterns.find(pat => pat.test(fileContents))) {
        focusedFiles.push(file)
      }

      if (index == files.length - 1) {
        allDone()
      }
    })
  })
}
