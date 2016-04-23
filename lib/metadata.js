var Dependency = require("webpack/lib/Dependency");

function RequireOnlyFocusedDependency() {
}
module.exports = RequireOnlyFocusedDependency;

RequireOnlyFocusedDependency.prototype = Object.create(Dependency.prototype);
RequireOnlyFocusedDependency.prototype.constructor = RequireOnlyFocusedDependency;
RequireOnlyFocusedDependency.prototype.type = "require.onlyFocused";

