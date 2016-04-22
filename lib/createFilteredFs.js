'use strict'

const filterFiles = require('./filterFiles')

const existingFsWrappers = {}

module.exports = function(fs, focusPatterns) {
  // avoid recreating a new FS wrapper if we already have one
  const filtered = existingFsWrappers[fs] || (existingFsWrappers[fs] = Object.create(fs))
  filtered.readdir = function(directory, callback) {
    fs.readdir(directory, function(err, files) {
      if (err) {
        return callback(err)
      }

      filterFiles(fs, focusPatterns, directory, files, callback)
    })
  }
  return filtered
}
