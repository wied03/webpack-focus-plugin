'use strict'

/*jshint expr: true*/

const expect = require('chai').expect
const webpack = require('webpack')
const rimraf = require('rimraf')
const path = require('path')
const fsExtra = require('fs-extra')
const mkdirp = require('mkdirp')
const readFile = require('fs').readFile

const tmpDir = path.resolve(__dirname, '../tmp')
const outputBaseDir = path.resolve(tmpDir, 'output')
const outputDir = path.resolve(outputBaseDir, 'loader')

const FocusPlugin = require('../index')

describe('integration', function() {
  const fixturesSrcDir = path.resolve(__dirname, 'fixtures')
  const fixturesDir = path.resolve(tmpDir, 'fixtures')

  function aFixture(file) {
    return path.join(fixturesDir, file)
  }

  beforeEach(function(done) {
    rimraf(tmpDir, function(err) {
      if (err) {
        return done(err)
      }
      mkdirp(outputDir, done)
    })
  })

  beforeEach(function(done) {
    fsExtra.copy(fixturesSrcDir, fixturesDir, done)
  })

  context('filters disabled', function() {
    it('includes everything', function(done) {
      const config = {
        output: {
          path: outputDir,
          filename: '[id].loader.js'
        },
        entry: aFixture('entry_filter_disabled.js'),
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
        expect(filenamesIncluded).to.have.length(7)
        done()
      })
    })

    it('does not leave the focus command in the output', function(done) {
      const config = {
        output: {
          path: outputDir,
          filename: '[id].loader.js'
        },
        entry: aFixture('entry_filter_disabled.js'),
        plugins: [
          new FocusPlugin([/some_pattern/])
        ]
      }

      webpack(config, (err) => {
        expect(err).to.be.null
        readFile(path.join(config.output.path, '0.loader.js'), function(err, data) {
          expect(err).to.be.null
          expect(data.toString()).to.not.match(/\s*onlyFocused\(false\)/)
          done()
        })
      })
    })
  })

  context('no filter plugin', function() {
    it('includes everything', function(done) {
      const config = {
        output: {
          path: outputDir,
          filename: '[id].loader.js'
        },
        entry: aFixture('entry_filter_disabled.js')
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
  })

  context('filter plugin no clause', function() {
    it('includes everything', function(done) {
      const config = {
        output: {
          path: outputDir,
          filename: '[id].loader.js'
        },
        entry: aFixture('entry_no_filter_clause.js'),
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
        expect(filenamesIncluded).to.have.length(7)
        done()
      })
    })
  })

  context('filters enabled', function() {
    it('only includes focused', function(done) {
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

    it('does not leave the focus command in the output', function(done) {
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

      webpack(config, (err) => {
        expect(err).to.be.null
        readFile(path.join(config.output.path, '0.loader.js'), function(err, data) {
          expect(err).to.be.null
          expect(data.toString()).to.not.match(/\s*onlyFocused\(true\)/)
          done()
        })
      })
    })

    it('is not affected by order', function(done) {
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

    it('can turn the filter off and back on', function(done) {
      if (process.env.FILE_WATCH_ISSUES) {
        this.skip()
        return done()
      }
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
      var runCount = 0
      var watcher = compiler.watch({}, (err, stats) => {
        runCount += 1
        console.log(stats.toString())
        expect(err).to.be.null
        const compilation = stats.compilation
        expect(compilation.errors).to.be.empty
        const filenamesIncluded = compilation.chunks[0].modules.map(mod => mod.resource)

        if (runCount == 1) {
          expect(filenamesIncluded).to.have.length(4)
          fsExtra.copy(aFixture('entry_filter_disabled.js'), aFixture('entry.js'), {
            clobber: true
          }, function(err) {
            if (err) {
              return done(err)
            }
            console.log('copied, should now trigger again with filters disabled')
          })
        } else if (runCount == 2) {
          expect(filenamesIncluded).to.have.length(7)
          fsExtra.copy(path.join(fixturesSrcDir, 'entry.js'), aFixture('entry.js'), {
            clobber: true
          }, function(err) {
            if (err) {
              return done(err)
            }
            console.log('copied, should now trigger again with filters enabled')
          })
        } else {
          expect(filenamesIncluded).to.have.length(4)
          watcher.close(done)
        }
      })
    })
  })
})
