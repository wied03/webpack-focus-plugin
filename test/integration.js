'use strict'

const expect = require('chai').expect
const webpack = require('webpack')
const rimraf = require('rimraf')

const tmpDir = path.resolve(__dirname, '../../tmp')
const outputBaseDir = path.resolve(tmpDir, 'output')

const FocusPlugin = require('../index')

describe('integration', function() {
  const fixturesDir = path.resolve(__dirname, '../fixtures')
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

  it('works', function(done) {
    const config = {
      output: {
        path: outputDir,
        filename: '[id].loader.js'
      },
      entry: aFixture('entry.js')
      plugins: [
        new FocusPlugin([/some_pattern/])
      ]
    }

    webpack(config, (err, stats) => {
      expect(err).to.be.null
      expect(stats).to.be.null
      done()
    })
  })
})
