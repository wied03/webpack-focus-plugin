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

function getAllFocusedFiles(fs, focusPatterns, directory, callback) {
  fs.readdir(directory, function(err, files) {
    if (err) {
      return callback(err)
    }

    var focusedFiles = []

    function repeater(index) {
      if (index >= files.length) {
        return callback(null, focusedFiles)
      }
      var file = files[index]
      var fullPath = path.join(directory, file)
      processFileStats(fs, fullPath, file, function(err, isDirectory) {
        if (err) {
          return callback(err)
        }

        if (isDirectory) {
          getAllFocusedFiles(fs, focusPatterns, fullPath, function(err, moreFocusedFiles) {
            if (err) {
              return callback(err)
            }
            focusedFiles = focusedFiles.concat(moreFocusedFiles)
            repeater(index + 1)
          })
        } else {
          processFileContents(fs, fullPath, file, focusPatterns, function(err, isFocused) {
            if (err) {
              return webpackCallback(err)
            }

            if (isFocused) {
              focusedFiles.push(fullPath)
            }

            repeater(index + 1)
          })
        }
      })
    }
    repeater(0)
  })
}

function filterFiles(focusedFiles, directory, files, fs, callback) {
  if (focusedFiles.length == 0) {
    return callback(null, files)
  }

  const results = []

  function repeater(index) {
    if (index >= files.length) {
      return callback(null, results)
    }
    var file = files[index]
    var fullPath = path.join(directory, file)
    if (focusedFiles.indexOf(fullPath) != -1) {
      results.push(file)
      return repeater(index + 1)
    }
    processFileStats(fs, fullPath, file, function(err, isDirectory) {
      if (err) {
        return callback(err)
      }

      if (isDirectory) {
        results.push(file)
      }
      repeater(index + 1)
    })
  }
  repeater(0)
}

module.exports = {
  getAllFocusedFiles: getAllFocusedFiles,
  filterFiles: filterFiles
}
