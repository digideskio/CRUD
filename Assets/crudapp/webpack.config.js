var path = require('path');
var phifty = require('phifty');
var webpack = require("phifty/node_modules/webpack");
var excludePaths = phifty.webpackExcludePaths();
var aliases = phifty.assetAliases();

module.exports = {
  entry: __dirname + '/entry.js',
  output: { path: __dirname, filename: './bundle.js' },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      loaders: ['babel-loader'],
      exclude: excludePaths
    }]
  },
  externals: {
    // don't bundle the 'react' npm package with our bundle.js
    // but get it from a global 'React' variable
    'react': 'React'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    fallback: [ path.join(__dirname, "node_modules"), phifty.moduleDirectory],
    alias: aliases
  },
  resolveLoader: {
    fallback: [ path.join(__dirname, "node_modules"), phifty.moduleDirectory]
  }
};
