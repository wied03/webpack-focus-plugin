'use strict'

/*jshint expr: true*/

const expect = require('chai').expect
const webpack = require('webpack')
const rimraf = require('rimraf')
const path = require('path')
const fsExtra = require('fs-extra')
const mkdirp = require('mkdirp')

const tmpDir = path.resolve(__dirname, '../tmp')
const outputBaseDir = path.resolve(tmpDir, 'output')
const outputDir = path.resolve(outputBaseDir, 'loader')

const FocusPlugin = require('../index')

describe('integration', function() {
  const fixturesSrcDir = path.resolve(__dirname, 'fixtures')
  const fixturesDir = path.resolve(tmpDir, 'fixtures')
  function aFixture(file) { return path.join(fixturesDir, file) }

  beforeEach(function (done) {
    rimraf(tmpDir, function(err) {
      if (err) { return done(err) }
      mkdirp(outputDir, done)
    })
  })

  beforeEach(function(done) {
    fsExtra.copy(fixturesSrcDir, fixturesDir, done)
  })

  it('without filters', function(done) {
    const config = {
      output: {
        path: outputDir,
        filename: '[id].loader.js'
      },
      entry: aFixture('entry_no_filter.js')
    }

    webpack(config, (err, stats) => {
      console.log(stats.toString())
      expect(err).to.be.null
      const compilation = stats.compilation
      expect(compilation.errors).to.be.empty
      const filenamesIncluded = compilation.chunks[0].modules.map(mod => mod.resource)
      expect(filenamesIncluded).to.have.length(7)
      done()
    })
  })

  it('filters', function(done) {
    const config = {
      output: {
        path: outputDir,
        filename: '[id].loader.js'
      },
      entry: aFixture('entry.js'),
      plugins: [
        new FocusPlugin([/some_pattern/])
      ]
    }

    webpack(config, (err, stats) => {
      console.log(stats.toString())
      expect(err).to.be.null
      const compilation = stats.compilation
      expect(compilation.errors).to.be.empty
      const filenamesIncluded = compilation.chunks[0].modules.map(mod => mod.resource)
      expect(filenamesIncluded).to.have.length(4)
      done()
    })
  })

  it.only('turns filters off if the statement is removed from the entry point', function(done) {
    const config = {
      output: {
        path: outputDir,
        filename: '[id].loader.js'
      },
      entry: aFixture('entry.js'),
      plugins: [
        new FocusPlugin([/some_pattern/])
      ]
    }
    const compiler = webpack(config)
    var firstRun = true
    compiler.watch({}, (err, stats) => {
      console.log(stats.toString())
      expect(err).to.be.null
      const compilation = stats.compilation
      expect(compilation.errors).to.be.empty
      const filenamesIncluded = compilation.chunks[0].modules.map(mod => mod.resource)

      if (firstRun) {
        firstRun = false
        expect(filenamesIncluded).to.have.length(4)
        fsExtra.copy(aFixture('entry_no_filter.js'), aFixture('entry.js'), {clobber: true}, function(err) {
          console.log('copied, should now trigger again')
        })
      }
      else {
        expect(filenamesIncluded).to.have.length(7)
        done()
      }
    })
  })

  it('filters regardless of order', function(done) {
    const config = {
      output: {
        path: outputDir,
        filename: '[id].loader.js'
      },
      entry: aFixture('entry_non_focus_first.js'),
      plugins: [
        new FocusPlugin([/some_pattern/])
      ]
    }

    webpack(config, (err, stats) => {
      console.log(stats.toString())
      expect(err).to.be.null
      const compilation = stats.compilation
      expect(compilation.errors).to.be.empty
      const filenamesIncluded = compilation.chunks[0].modules.map(mod => mod.resource)
      expect(filenamesIncluded).to.have.length(3)
      done()
    })
  })
})
