'use strict'

/*jshint expr: true*/

const expect = require('chai').expect

const createFilteredFs = require('../../lib/createFilteredFs')

describe('filteredFs', function() {
  const mockFs = {
    readdir: function (directory, callback) {
      if (directory === 'error') {
        callback(new Error('a problem'))
      }
      else {
        callback(null, ['file1', 'file2'])
      }
    },
    readFile: function(path, callback) {
      callback(null, 'nothing')
    },
    stat: function(filename, callback) {
      const result = {
        isDirectory: function() {
          return false
        }
      }
      callback(null, result)
    }
  }

  const mochaScope = this
  beforeEach(function() {
    mochaScope.focusState = {enabled: false}
  })

  function doFilteredFs(fs, patterns) {
    return createFilteredFs(mochaScope.focusState, fs, patterns)
  }

  it('creates a filtered filesystem', function(done) {
    const filteredFs = doFilteredFs(mockFs, [])

    filteredFs.readdir('foobar', function(err, files) {
      expect(files).to.have.length(2)
      expect(files[0]).to.eq('file1')
      expect(files[1]).to.eq('file2')
      done()
    })
  })

  it('passes on errors', function(done) {
    const filteredFs = doFilteredFs(mockFs, [])

    filteredFs.readdir('error', function(err, files) {
      expect(err.message).to.eq('a problem')
      expect(files).to.be.undefined
      done()
    })
  })

  it('remembers instances for the same filesystem', function() {
    const filteredFs = doFilteredFs(mockFs, [])
    const filteredFs2 = doFilteredFs(mockFs, [])

    expect(filteredFs2).to.eq(filteredFs)
  })
})
