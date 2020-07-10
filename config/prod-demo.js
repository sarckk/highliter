const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const baseConfig = require('./base.demo');

const config = {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!.git']
    })
  ],
  output: {
    filename: 'index.[contenthash].js'
  }
};

module.exports = merge(baseConfig, config);
