'use strict'

/*jshint expr: true*/

const expect = require('chai').expect
const path = require('path')

const filterFiles = require('../../lib/filterFiles')

describe('filterFiles', function() {
  const mockFs = {
    readFile: function(fullPath, callback) {
      expect(path.dirname(fullPath)).to.eq('foobar')
      const base = path.basename(fullPath)

      if (base === 'file1') {
        callback(null, 'does not contain anything special')
      }
      else if (base === 'some_dir') {
        callback(new Error('cannot read a directory'))
      }
      else {
        callback(null, 'does contain some_pattern')
      }
    },
    stat: function(filename, callback) {
      const result = {
        isDirectory: function() {
          return filename === 'foobar/some_dir'
        }
      }

      callback(null, result)
    }
  }

  function doFilter(ignorePatterns, files, callback) {
    filterFiles(mockFs, ignorePatterns, 'foobar', files, callback)
  }

  context('single path, no dirs', function() {
    it('filters', function(done) {
      doFilter([/some_pattern/], ['file1', 'file2'], function(err, files) {
        expect(err).to.be.null
        expect(files).to.have.length(1)
        expect(files[0]).to.eq('file2')
        done()
      })
    })

    it('does not filter when no matches occur', function(done) {
      doFilter([/other_pattern/], ['file1', 'file2'], function(err, files) {
        expect(err).to.be.null
        expect(files).to.have.length(2)
        done()
      })
    })
  })

  context('single path, with dirs', function() {
    it('filters', function(done) {
      doFilter([/some_pattern/], ['file1', 'file2', 'some_dir'], function(err, files) {
        expect(err).to.be.null
        expect(files).to.have.length(2)
        expect(files[1]).to.eq('file2')
        expect(files[0]).to.eq('some_dir')
        done()
      })
    })

    it('does not filter when no matches occur', function(done) {
      doFilter([/other_pattern/], ['file1', 'file2', 'some_dir'], function(err, files) {
        expect(err).to.be.null
        expect(files).to.have.length(3)
        done()
      })
    })
  })

  it('does not filter when patterns are empty', function(done) {
    doFilter([], ['file1', 'file2'], function(err, files) {
      expect(err).to.be.null
      expect(files).to.have.length(2)
      done()
    })
  })
})
