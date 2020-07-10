const { merge } = require('webpack-merge');
const path = require('path');
const baseConfig = require('./base.demo');
const { rootDir } = require('./constants');

const config = {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    contentBase: path.resolve(rootDir, 'demo/dist'),
    inline: true,
    hot: true,
    host: 'localhost',
    port: 8080
  }
};

module.exports = merge(baseConfig, config);
