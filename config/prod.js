const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.js');

const config = {
  mode: 'production',
  output: {
    filename: 'highliter.min.js'
  },
  plugins: [new CleanWebpackPlugin()],
  devtool: 'source-map'
};

module.exports = merge(baseConfig, config);
