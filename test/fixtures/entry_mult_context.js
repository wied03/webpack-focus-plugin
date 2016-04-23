require.onlyFocused()
var testsContext = require.context("./tests", true, /_test\.js$/);
testsContext.keys().forEach(testsContext);
var otherContext = require.context("./other_tests", true, /_test\.js$/);
otherContext.keys().forEach(otherContext);
