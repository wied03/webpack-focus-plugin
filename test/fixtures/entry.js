require.onlyFocused()
var testsContext = require.context("./tests", true, /_test\.js$/);
testsContext.keys().forEach(testsContext);
