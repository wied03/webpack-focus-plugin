var testsContext = require.context("./non_focus_dir_first", true, /_test\.js$/);
testsContext.keys().forEach(testsContext);
