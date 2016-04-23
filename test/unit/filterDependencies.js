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
    filterDependencies(mockFs, patterns, dependencies, callback)
  }

  it('is focused', function (done) {
    const deps = [
      {
        loc: 'is_focused',
        context: 'some_dir'
      },
      {
        loc: 'is_not_focused',
        context: 'some_dir'
      }
    ]

    doFilter([/the_pattern/], deps, function(err, deps) {
      expect(err).to.be.null
      expect(deps).to.eql([{loc: 'is_not_focused', context: 'some_dir'}])
      done()
      })
  })

  it('is not focused', function (done){
    const deps = [
      {
        loc: 'is_focused',
        context: 'some_dir'
      },
      {
        loc: 'is_not_focused',
        context: 'some_dir'
      }
    ]

    doFilter([/other_pattern/], deps, function(err, deps) {
      expect(err).to.be.null
      expect(deps).to.have.length(2)
      done()
      })
  })
})
