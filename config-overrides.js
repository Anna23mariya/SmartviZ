const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify"),
    "url": require.resolve("url"),
    "util": require.resolve("util"),
    "timers": require.resolve("timers-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "process": require.resolve("process/browser"),
    "path": require.resolve("path-browserify"),
    "fs": false,
    "dns": false,
    "net": false,
    "tls": false,
    "child_process": false,
    "timers/promises": false,
    "fs/promises": false,
    "util/types": false
  });
  
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer']
    })
  ]);
  
  return config;
}