'use strict'

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
  const fixturesDir = path.resolve(__dirname, 'fixtures')
  function aFixture(file) { return path.join(fixturesDir, file) }

  beforeEach(function(done) {
    fsExtra.mkdirp('./tmp', done)
  })

  beforeEach(function (done) {
    rimraf(outputBaseDir, function(err) {
      if (err) { return done(err) }
      mkdirp(outputDir, done)
    })
  })

  it('without filters', function(done) {
    const config = {
      output: {
        path: outputDir,
        filename: '[id].loader.js'
      },
      entry: aFixture('entry.js')
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
})
