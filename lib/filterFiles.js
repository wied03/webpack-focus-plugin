'use strict'

const path = require('path')

function processFileStats(fs, fullPath, file, callback) {
  fs.stat(fullPath, function(err, stats) {
    if (err) {
      callback(err)
    }

    callback(null, stats.isDirectory())
  })
}

function processFileContents(fs, fullPath, file, focusPatterns, callback) {
  fs.readFile(fullPath, function(err, data) {
    var fileContents = data.toString()

    const found = focusPatterns.find(pat => pat.test(fileContents))
    callback(null, found)
  })
}

// TODO: Support filtering across multiple contexts, this only works within a context
module.exports = function(fs, focusPatterns, directory, files, webpackCallback) {
  const focusedFiles = []
  const directories = []

  function repeater(index) {
    if (index >= files.length) {
      const result = focusedFiles.length > 0 ? directories.concat(focusedFiles) : files
      return webpackCallback(null, result)
    }
    var file = files[index]
    var fullPath = path.join(directory, file)
    processFileStats(fs, fullPath, file, function(err, isDirectory) {
      if (err) {
        return webpackCallback(err)
      }

      if (isDirectory) {
        directories.push(file)
        repeater(index + 1)
      } else {
        processFileContents(fs, fullPath, file, focusPatterns, function(err, isFocused) {
          if (err) {
            return webpackCallback(err)
          }

          if (isFocused) {
            focusedFiles.push(file)
          }

          repeater(index + 1)
        })
      }
    })
  }
  repeater(0)
}
