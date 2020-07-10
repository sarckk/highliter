const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.js');

const config = {
  mode: 'production',
  output: {
    filename: 'underscore.min.js'
  },
  plugins: [new CleanWebpackPlugin()],
  devtool: 'eval-source-map'
};

module.exports = merge(baseConfig, config);
