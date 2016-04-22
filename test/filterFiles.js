'use strict'

const expect = require('chai').expect
const path = require('path')

const filterFiles = require('../lib/filterFiles')

describe('filterFiles', function() {
  const mockFs = {
    readFile: function(fullPath, callback) {
      expect(path.dirname(fullPath)).to.eq('foobar')
      const base = path.basename(fullPath)

      if (base === 'file1') {
        callback(null, 'does not contain anything special')
      }
      else {
        callback(null, 'does contain some_pattern')
      }
    }
  }

  function doFilter(ignorePatterns, files, callback) {
    filterFiles(mockFs, ignorePatterns, 'foobar', files, callback)
  }

  context('single path, no dirs', function() {
    it('filters', function(done) {
      doFilter([/some_pattern/], ['file1', 'file2'], function(err, files) {
        expect(files).to.have.length(1)
        expect(files[0]).to.eq('file2')
        done()
      })
    })

    it('does not filter when no matches occur', function(done) {
      doFilter([/other_pattern/], ['file1', 'file2'], function(err, files) {
        expect(files).to.have.length(2)
        done()
      })
    })
  })

  context('single path, with dirs', function() {
    it('filters')

    it('does not filter when no matches occur')
  })

  it('does not filter when patterns are empty', function(done) {
    doFilter([], ['file1', 'file2'], function(err, files) {
      expect(files).to.have.length(2)
      done()
    })
  })
})
