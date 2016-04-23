'use strict'

/*jshint expr: true*/

const expect = require('chai').expect

const filterDependencies = require('../../lib/filterDependencies')

describe('filterDependencies', function () {
  const mockFs = {
    readFile: function(filename, callback) {
      if (filename === 'some_dir/is_focused') {
        callback(null, "the_pattern")
      }
      else {
        callback(null, 'something else')
      }
    }
  }

  function doFilter(patterns, dependencies, callback) {
    filterDependencies(mockFs, patterns, 'some_dir' ,dependencies, callback)
  }

  it('is focused', function (done) {
    const deps = [
      {
        request: 'is_focused',
      },
      {
        request: 'is_not_focused',
      }
    ]

    doFilter([/the_pattern/], deps, function(err, deps) {
      expect(err).to.be.null
      expect(deps).to.eql([{request: 'is_focused'}])
      done()
      })
  })

  it('is not focused', function (done){
    const deps = [
      {
        request: 'is_focused',
      },
      {
        request: 'is_not_focused',
      }
    ]

    doFilter([/other_pattern/], deps, function(err, deps) {
      expect(err).to.be.null
      expect(deps).to.be_empty
      done()
      })
  })
})
