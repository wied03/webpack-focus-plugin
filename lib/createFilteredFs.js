'use strict'

const fileFocus = require('./fileFocus')

const existingFsWrappers = {}

module.exports = function(focusState, fs, focusPatterns) {
  // avoid recreating a new FS wrapper if we already have one
  const filtered = existingFsWrappers[fs] || (existingFsWrappers[fs] = Object.create(fs))

  filtered.readdir = function(directory, callback) {
    const doDirectoryRead = function() {
      fs.readdir(directory, function(err, files) {
        if (err) {
          return callback(err)
        }

        fileFocus.filterFiles(focusState.files, directory, files, fs, function(err, filtered) {
          if (err) {
            return callback(err)
          }
          callback(null, filtered)
        })
      })
    }

    if (typeof focusState.files === 'undefined') {
      fileFocus.getAllFocusedFiles(fs, focusPatterns, directory, function(err, allFocused) {
        if (err) {
          return callback(err)
        }

        focusState.files = allFocused

        doDirectoryRead()
      })
    } else {
      doDirectoryRead()
    }
  }
  return filtered
}
