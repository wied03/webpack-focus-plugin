const FocusPlugin = require('./index')

module.exports = {
  output: {
    path: './tmp/output/loader',
    filename: '[id].loader.js'
  },
  entry: './test/fixtures/entry_mult_context.js',
  plugins: [
    new FocusPlugin([/some_pattern/])
  ]
}
