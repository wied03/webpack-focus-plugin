'use strict'

/*jshint expr: true*/

const expect = require('chai').expect
const path = require('path')

const fileFocus = require('../../lib/fileFocus')

describe('fileFocus', function() {
  const mockFs = {
    readdir: function(dirName, callback) {
      if (dirName === 'foobar') {
        callback(null, ['file1', 'file2'])
      }
      else if (dirName === 'foobar2') {
        callback(null, ['file1', 'file2', 'some_dir'])
      }
      else if (dirName == 'foobar2/some_dir') {
        callback(null, ['file4', 'file5'])
      }
    },
    readFile: function(fullPath, callback) {
      const base = path.basename(fullPath)

      if (base === 'file1' || base === 'file4') {
        callback(null, 'does not contain anything special')
      } else if (base === 'some_dir') {
        callback(new Error('cannot read a directory'))
      } else {
        callback(null, 'does contain some_pattern')
      }
    },
    stat: function(filename, callback) {
      const result = {
        isDirectory: function() {
          return filename === 'foobar2/some_dir'
        }
      }

      callback(null, result)
    }
  }

  function getAllFocusedFiles(focusPatterns, callback, directory) {
    directory = directory || 'foobar'
    fileFocus.getAllFocusedFiles(mockFs, focusPatterns, directory, callback)
  }

  function filterFiles(focusedFiles, directory, files, callback) {
    directory = directory || 'foobar'
    fileFocus.filterFiles(focusedFiles, directory, files, mockFs, callback)
  }

  context('single path, no dirs', function() {
    describe('getAllFocusedFiles', function() {
      it('works', function(done) {
        getAllFocusedFiles([/some_pattern/], function(err, files) {
          expect(err).to.be.null
          expect(files).to.eql(['foobar/file2'])
          done()
        })
      })

      it('returns no matches if there are none', function(done) {
        getAllFocusedFiles([/other_pattern/], function(err, files) {
          expect(err).to.be.null
          expect(files).to.be_empty
          done()
        })
      })
    })

    describe('filterFiles', function() {
      it('focused files', function(done) {
        filterFiles(['foobar/file2'], 'foobar', ['file2', 'file3'], function(err, result) {
          expect(err).to.be.null
          expect(result).to.eql(['file2'])
          done()
        })
      })

      it('directories', function(done) {
        filterFiles(['foobar2/file2'], 'foobar2', ['file1', 'file2', 'some_dir'], function(err, result) {
          expect(err).to.be.null
          expect(result).to.eql(['file2', 'some_dir'])
          done()
        })
      })

      it('no filters', function(done) {
        filterFiles([], 'foobar', ['file2', 'file3'], function(err, result) {
          expect(err).to.be.null
          expect(result).to.eql(['file2', 'file3'])
          done()
        })
      })
    })
  })

  context('single path, with dirs', function() {
    describe('getAllFocusedFiles', function() {
      it('works', function(done) {
        getAllFocusedFiles([/some_pattern/], function(err, files) {
          expect(err).to.be.null
          expect(files).to.eql(['foobar2/file2', 'foobar2/some_dir/file5'])
          done()
        }, 'foobar2')
      })

      it('returns no matches if there are none', function(done) {
        getAllFocusedFiles([/other_pattern/], function(err, files) {
          expect(err).to.be.null
          expect(files).to.be_empty
          done()
        })
      })
    })
  })
})
