'use strict'

const AbstractPlugin = require("webpack/lib/AbstractPlugin")
const ConstDependency = require("webpack/lib/dependencies/ConstDependency")

module.exports = AbstractPlugin.create({
  "call onlyFocused": function(expr) {
    const focusEnabled = expr.arguments[0].value
    this.state.current.onlyFocusedSpecsRun = focusEnabled
    // only here to ensure 'onlyFocused' doesn't actually get executed
    var dep = new ConstDependency(`/* onlyFocused tests ${focusEnabled} */`, expr.range);
    dep.loc = expr.loc;
    this.state.current.addDependency(dep)
    return true
  }
})
