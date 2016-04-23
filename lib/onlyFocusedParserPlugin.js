const AbstractPlugin = require("webpack/lib/AbstractPlugin")

module.exports = AbstractPlugin.create({
  "call require.onlyFocused": function(expr) {
    this.state.current.onlyFocusedSpecsRun = true
    return true
  }
})
