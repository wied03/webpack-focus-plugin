const AbstractPlugin = require("webpack/lib/AbstractPlugin")

module.exports = AbstractPlugin.create({
  "call onlyFocused": function(expr) {
    this.state.current.onlyFocusedSpecsRun = expr.arguments[0]
    return true
  }
})
