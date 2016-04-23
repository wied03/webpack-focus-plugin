# Webpack Focus Plugin

[![Build Status](http://img.shields.io/travis/wied03/webpack-focus-plugin/master.svg?style=flat)](http://travis-ci.org/wied03/webpack-focus-plugin)
[![Quality](http://img.shields.io/codeclimate/github/wied03/webpack-focus-plugin.svg?style=flat-square)](https://codeclimate.com/github/wied03/webpack-focus-plugin)
[![Version](https://img.shields.io/npm/v/webpack-focus-plugin.svg?style=flat-square)](https://www.npmjs.com/package/webpack-focus-plugin)

Webpack plugin that allows you to specify regex patterns. Only files required from your entry point that match the regex (and their dependencies) will be included in the bundle.

It can be useful to speed up your test feedback cycle by only feeding specs with focused values to the browser.

## Installation:

```bash
npm install webpack-focus-plugin --save-dev
```

## Configuration:

Webpack config:
```js
module.exports = {
  entry: ['./entry_point.js'],
  plugins: [
    new FocusPlugin([/some_pattern/])
  ]
}
```

To tell the plugin whether to filter or not, add the following to your entry point:
```js
onlyFocused(true)
var testsContext = require.context("./tests", true, /_test\.js$/);
testsContext.keys().forEach(testsContext);
```

You can also change the argument to 'false' or omit the statement entirely, either one will disable the filter. Webpack watch should pick up the change.

## Limitations:
* TBD

Copyright (c) 2016, BSW Technology Consulting LLC
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
